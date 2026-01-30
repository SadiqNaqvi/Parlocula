import WarnTeamParlocula from "@components/EmailTemplates/warnParlocula";
import { getUserFromToken } from "@lib/auth/utils";
import { connectDatabase } from "@lib/database";
import { deleteMediaFiles, uploadMediaFiles } from "@lib/providers/media";
import { formDataToObject, getRevalidateTags } from "@lib/utils";
import { render } from "@react-email/components";
import { Frame, GeneralGetReturn, GeneralPostReturn } from "@type/internal";
import { AvailableRevalidateTags, ErrorCodes, RevalidateTagsArgs } from "@type/other";
import { FrameDataSchemaType } from "@type/schemas";
import mongoose, { ClientSession } from "mongoose";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { sendEmail } from "./server";
import { updateQuotaLimit } from "./redis/rate_limiting";

type RT = AvailableRevalidateTags

export type HandlerParamVariable = { id: string; cuid: string;[key: string]: string }

type NotArray<T> = T extends any[] ? never : T;

export type GetHandlerFunction<T> = (r: NextRequest, params: HandlerParamVariable) =>
    Promise<GeneralGetReturn<NotArray<T>> & { custom_error?: string }>

export type MutationHandlerFunctionParams<T = unknown> = {
    data: Omit<T, "files" | "filesData" | "filesToRemove">;
    frames: Frame[];
    user_id: string;
    isNsfw: boolean;
    username: string;
    profile: string | undefined;
    session: ClientSession;
    req: NextRequest;
    params: HandlerParamVariable;
};

export type PrecheckParams<T = unknown> = Omit<
    MutationHandlerFunctionParams<T>,
    "frames" | "session" | "profile" | "isNsfw"
>;

export type PrecheckResponse = Omit<GeneralPostReturn, "result">;

export type PrecheckFunction<T = unknown> = (p: PrecheckParams<T>) => PrecheckResponse | Promise<PrecheckResponse>;

export type WarningPayload = {
    title: string,
    desc: string,
    path: string,
}

export type HandlerResponse =
    | {
        result: any;
        success: true;
        warnTeamParlocula?: WarningPayload,
        errCode?: null;
        options: Partial<RevalidateTagsArgs<RT>>;
        available: RT;
        revalidateQueue?: undefined;
    }
    | {
        result: any;
        success: true;
        warnTeamParlocula?: WarningPayload,
        errCode?: null;
        options?: undefined;
        available?: undefined;
        revalidateQueue: string[];
    }
    | {
        result?: null;
        success: false;
        errCode: ErrorCodes;
        options?: undefined;
        warnTeamParlocula?: undefined,
        available?: undefined;
        revalidateQueue?: undefined;
    };

type DeleteHandlerResponse = Promise<Omit<HandlerResponse & { files?: Frame[] }, "result">>

export const getHandler = <T extends any>(handler: GetHandlerFunction<T>) => {
    return async function (req: NextRequest, { params }: { params: Promise<HandlerParamVariable> }) {
        try {
            const isDbConnected = await connectDatabase();
            if (!isDbConnected) return NextResponse.json(
                {
                    success: false,
                    errCode: "database_connection_fail",
                },
                { status: 500 }
            );

            const data = await handler(req, await params);

            return NextResponse.json(data, { status: data.success ? 200 : 500 });
        } catch (err: any) {
            console.error(`Error occurred at path ${req.nextUrl.pathname}:`, err.message);

            return NextResponse.json(
                {
                    errCode: "uncaught_error",
                    success: false,
                },
                { status: 500 }
            );
        }
    };
};

const uploadFiles = async (files: File[], filesData: FrameDataSchemaType[], checkNsfw: boolean) => {
    const results = await uploadMediaFiles(files);

    let isNsfw = false;

    const frames = filesData
        .map(({ isExternal, path, type, shouldUpload, hash, size }) => {

            if (!shouldUpload) return { path, type, isExternal, size, hash };

            const result = results.shift();

            if (!result)
                throw new Error("Media result could not be found");

            else if (checkNsfw && result.nsfw !== "No") {
                isNsfw = true;
            }

            return { path: result.path, type, isExternal, size, hash };

        });


    return { frames, isNsfw };

};

const deleteFiles = async (files: Frame[]) => {
    if (!files.length) return;
    const ids = files.filter((file) => !file.isExternal).map(({ path }) => path);
    await deleteMediaFiles(ids);
};

type HandlerData = { files?: File[], filesData?: any[], [key: string]: any }

const getDataFromRequest = async <T>(r: NextRequest, schema: ZodSchema | undefined): Promise<GeneralPostReturn<T>> => {
    const contentType = r.headers.get("Content-Type") || ""
    let tempdata: T;

    if (contentType.startsWith("multipart/form-data"))
        tempdata = formDataToObject(await r.formData()) as T;
    else if (contentType.startsWith("application/json"))
        tempdata = await r.json();
    else return { success: false, errCode: "custom_error", customError: "Content type is not valid" }

    if (schema && tempdata) {
        const { success, data, error } = schema.safeParse(tempdata);

        if (success) return { success, result: tempdata }
        else return { success: false, errCode: "form_error", formError: error.errors }
    }

    return { success: true, result: tempdata };
}

export const postHandler = <T extends HandlerData>({ handler, preCheck, schema, skipUserCheck }: {
    handler: (args: MutationHandlerFunctionParams<T>) => Promise<HandlerResponse>;
    preCheck?: PrecheckFunction<T>;
    schema?: ZodSchema;
    skipUserCheck?: boolean,
}) => {
    return async function (req: NextRequest, { params }: { params: Promise<HandlerParamVariable> }) {
        const payload = skipUserCheck ? null : await getUserFromToken(req.cookies);
        console.log(payload);
        const awaitedParams = await params;

        if (!skipUserCheck && !payload)
            return NextResponse.json(
                {
                    success: false,
                    errCode: "unauthenticated_access",
                    result: null,
                },
                { status: 500 }
            );

        const user_id = payload?.user_id || "";
        const username = payload?.username || "";
        const profile = payload?.profile

        const response = await getDataFromRequest<T>(req, schema);

        if (!response.success) return NextResponse.json(response, { status: 400 });

        const data = response.result;

        let frames: Frame[] = [];
        let revalidateTags: string[] = [];
        let session: ClientSession | null = null;

        try {
            const isDbConnected = await connectDatabase();
            if (!isDbConnected)
                return NextResponse.json(
                    {
                        result: null,
                        success: false,
                        errCode: "database_connection_fail",
                    },
                    { status: 500 }
                );

            if (preCheck) {

                const { errCode, success } = await preCheck({
                    req,
                    params: awaitedParams,
                    user_id,
                    username,
                    data,
                });

                if (!success)
                    return NextResponse.json(
                        { result: null, success, errCode },
                        { status: 500 }
                    );
            }

            session = await mongoose.connection.startSession();
            let isNsfw = false;
            const { files, filesData, filesToRemove, ...rest } = data;
            if (files && files.length && filesData && filesData.length) {
                const res = await uploadFiles(files, filesData, !data.nsfw)
                frames = res.frames;
                isNsfw = res.isNsfw;
            }


            session.startTransaction();

            const { available, errCode, options, result, success, revalidateQueue, warnTeamParlocula } =
                await handler({
                    data: rest,
                    frames,
                    user_id: user_id as string,
                    username: username as string,
                    session,
                    req,
                    params: awaitedParams,
                    profile: profile?.path,
                    isNsfw,
                });

            if (!success) {
                await deleteFiles(frames);
                await session.abortTransaction().catch(console.error);
            } else {
                if (warnTeamParlocula) {
                    await sendEmail({
                        email: process.env.CREATOR_EMAIL!,
                        subject: "Warning from Parlocula",
                        template: await render(WarnTeamParlocula(warnTeamParlocula))
                    });
                }

                if (revalidateQueue && revalidateQueue.length) {
                    revalidateTags = revalidateQueue;
                } else if (available && options) {
                    revalidateTags = getRevalidateTags(available, options);
                }

                await session.commitTransaction().catch(console.error);
            }

            return NextResponse.json(
                { result, success, errCode },
                { status: success ? 200 : 500 }
            );
        } catch (err: any) {
            await deleteFiles(frames);
            if (session?.inTransaction())
                await session.abortTransaction().catch(console.error);

            console.error(
                `Error occurred while POST at path ${req.nextUrl.pathname}:`,
                err.message
            );

            return NextResponse.json({
                result: null,
                success: false,
                errCode: "unknown_error",
            }, { status: 500 });
        } finally {
            session?.endSession();
            revalidateTags.forEach((tag) => revalidateTag(tag, "max"));
        }
    };
};

export const deleteHandler = (
    handler: (args: Omit<MutationHandlerFunctionParams, "frames" | "data" | "isNsfw">) => DeleteHandlerResponse,
    precheck?: (req: NextRequest, params: any) => PrecheckResponse | Promise<PrecheckResponse>
) => {
    return async (req: NextRequest, { params }: { params: Promise<HandlerParamVariable> }) => {
        const payload = await getUserFromToken(req.cookies);

        if (!payload)
            return NextResponse.json({ success: false, errCode: "unauthenticated_access" });

        const user_id = payload.user_id;
        const username = payload.username;
        const profile = payload.profile;

        let revalidateTags: string[] = [];
        let session: ClientSession | null = null;

        try {
            const isDbConnected = await connectDatabase();
            if (!isDbConnected)
                return NextResponse.json({ success: false, errCode: "database_connection_fail" });

            if (precheck) {
                const { success, errCode } = await precheck(req, params);
                if (!success) return NextResponse.json({ success, errCode });
            }

            session = await mongoose.connection.startSession();

            session.startTransaction();
            const { errCode, success, available, options, files, revalidateQueue } =
                await handler({
                    req,
                    user_id,
                    params: await params,
                    username,
                    session,
                    profile: profile?.path,
                });

            if (success) {
                files && (await deleteFiles(files));
                await session.commitTransaction();
                if (revalidateQueue && revalidateQueue.length)
                    revalidateTags = revalidateQueue;
                else if (available && options)
                    revalidateTags = getRevalidateTags(available, options);
            } else await session.abortTransaction().catch(console.error);

            return NextResponse.json({ success, errCode });
        } catch (err: any) {
            await session?.abortTransaction().catch(console.error);
            console.error("Error occured while deleting resource", err.message);
            return NextResponse.json({
                success: false,
                errCode: "unknown_error",
            });
        } finally {
            session?.endSession();
            revalidateTags.forEach((tag) => revalidateTag(tag, "max"));
        }
    };
};

export const updateHandler = <T extends HandlerData>({ handler, preCheck, schema }: {
    handler: (args: MutationHandlerFunctionParams<T>) => Promise<HandlerResponse>;
    preCheck?: PrecheckFunction<T>;
    schema?: ZodSchema;
}) => {
    return async (req: NextRequest, { params }: { params: Promise<HandlerParamVariable> }) => {
        // Checking if there is a current user and taking it's user_id and username
        const payload = await getUserFromToken(req.cookies);
        const awaitedParams = await params;

        if (!payload)
            return NextResponse.json(
                { success: false, errCode: "unauthenticated_access" },
                { status: 401 }
            );

        const user_id = payload.user_id;
        const username = payload.username;
        const profile = payload.profile;

        const response = await getDataFromRequest<T>(req, schema);

        if (!response.success) return NextResponse.json(response, { status: 402 });

        const data = response.result;

        let revalidateTags: string[] = [];
        let frames: Frame[] = [];
        let session: ClientSession | null = null;
        try {
            const isDbConnected = await connectDatabase();
            if (!isDbConnected)
                return NextResponse.json({
                    result: null,
                    success: false,
                    errCode: "database_connection_fail",
                });

            session = await mongoose.connection.startSession();

            // Some pre-checking eg: if the user is authorized to do this specific thing or not
            if (preCheck) {
                const { errCode, success } = await preCheck({
                    data,
                    params: awaitedParams,
                    req,
                    user_id,
                    username,
                });
                if (!success)
                    return NextResponse.json({ success, errCode }, { status: 500 });
            }

            const { files, filesData, filesToRemove, ...rest } = data;
            let isNsfw = false;
            if (files && files.length && filesData && filesData.length) {
                const res = await uploadFiles(files, filesData, !data.nsfw)
                frames = res.frames;
                isNsfw = Boolean(res.isNsfw)
            }

            session.startTransaction();
            const { available, errCode, options, result, success, revalidateQueue, warnTeamParlocula } =
                await handler({
                    data: rest,
                    isNsfw,
                    frames,
                    user_id,
                    username,
                    profile: profile?.path,
                    session,
                    req,
                    params: awaitedParams,
                });

            if (success) {

                await updateQuotaLimit(req, user_id);

                if (warnTeamParlocula) {
                    await sendEmail({
                        email: process.env.CREATOR_EMAIL!,
                        subject: "Warning from Parlocula",
                        template: await render(WarnTeamParlocula(warnTeamParlocula))
                    });
                }
                await deleteFiles(filesToRemove);

                if (revalidateQueue && revalidateQueue.length)
                    revalidateTags = revalidateQueue;
                else if (available && options)
                    revalidateTags = getRevalidateTags(available, options);

                await session.commitTransaction();
            } else {
                await deleteFiles(frames);
                await session.abortTransaction().catch(console.error);
            }

            return NextResponse.json(
                { result, success, errCode },
                { status: success ? 200 : 500 }
            );
        } catch (err: any) {
            await session?.abortTransaction().catch(console.error);
            console.error(
                `Error occured at path ${req.nextUrl.pathname} while updating data`,
                err.message
            );
            await deleteFiles(frames);
            return NextResponse.json(
                {
                    result: null,
                    success: false,
                    errCode: "unknown_error",
                },
                { status: 500 }
            );
        } finally {
            session?.endSession();
            revalidateTags.forEach((tag) => revalidateTag(tag, "max"));
        }
    };
};
