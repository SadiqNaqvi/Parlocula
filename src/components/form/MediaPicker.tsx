"use client";

import { AddIcon, XmarkIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import { mediaInputConfig, numberOfFrames, oneKb } from "@lib/constants";
import appToast from "@lib/providers/toast";
import { fileSchema, megaFileSchema } from "@lib/schemas";
import { createThumbHash, generateSnapshot, scaleImage, showSize } from "@lib/helpers/media";
import { InputManagerType, TypedFunction } from "@type/other";
import { InputFrame } from "@type/schemas";
import Image from "next/image";
import { ChangeEvent, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import { Form, Input } from ".";

type FrameToReturn = InputFrame & { thumb?: string }

type MediaType = "image" | "video";

const showError = (err: string) => {
    appToast.error(err)
}

const FrameContainer = ({ path, type, size, thumb, remove }: FrameToReturn & { remove?: TypedFunction<string> }) => {

    const ExtraComponents = () => (
        <>
            {remove && (
                <button
                    onClick={() => remove(path)}
                    className="absolute smallBtn p-1 right-0 top-0 mt-1 mr-1 bg-gray30 border border-gray40 rounded-md">
                    <XmarkIcon className="h-4" />
                </button>
            )}

            <span className="absolute bottom-0 right-0 mr-2 mb-2 bg-black text-sm bg-opacity-50 text-white rounded-md p-1">
                {showSize(size)}
            </span>
        </>
    )

    if (type === "image") return (
        <div className="size-60 border rounded-md border-gray40 relative">
            <Image
                className="aspect-square h-full object-contain"
                src={path}
                alt=""
                width={240} height={240}
            />
            <ExtraComponents />
        </div>
    )

    else return (
        <div className="size-60 border rounded-md border-gray40 relative">
            <video
                height={240}
                width={240}
                poster={thumb}
                preload={thumb ? "none" : "metadata"}
                className="size-full h-full object-contain"
            >
                <source src={path} />
            </video>
            <ExtraComponents />
        </div>
    )

}

const ImageUploader = ({ setFrame }: { setFrame: TypedFunction<FrameToReturn> }) => {

    const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file: File = event.target.files[0];

        const test = fileSchema.safeParse(file);

        if (!test.success) return showError(test.error.message);

        const [blob, hash] = await Promise.all([
            scaleImage(file),
            createThumbHash(file),
        ]);

        if (!blob) return showError("Failed to upload image! Please try again.");

        const path = URL.createObjectURL(blob);

        setFrame({
            type: "image",
            size: blob.size,
            path,
            blob,
            isExternal: false,
            shouldUpload: true,
            hash,
            thumb: path
        });
    }

    return (
        <div className="p-4 space-y-4">
            <p className="text-zinc-500 text-center">
                Image should be less than {mediaInputConfig.image.size.label}.
            </p>

            <div className="relative pointer">
                <button className="primary w-full sm:w-fit sm:mx-auto">Upload</button>
                <input
                    onChange={handleMediaUpload}
                    className="absolute inset-0 opacity-0"
                    title="" type="file"
                    accept={mediaInputConfig.image.accept}
                />
            </div>
        </div>
    )

}

const VideoUploader = ({ setFrame }: { setFrame: TypedFunction<FrameToReturn> }) => {

    const [loading, setLoading] = useState(false);

    const attachVideo = async (data: { url: string }) => {

        const [id, key] = data.url.split("/").at(-1)?.split("#") || [];
        if (!id || !key) return;

        const path = `https://testlalaapp.vercel.app/api/media/${id}-${key}`;
        setLoading(true);

        const errMsg = "Wrong Link! Please make sure your internet connection is stable and file exists";

        const resp = await fetch(path, { headers: { "Range": `bytes=0-${oneKb}` } })
            .then(r => {
                const size = Number(r.headers.get("Content-Length") || 0);
                const type = r.headers.get("Content-type") || "";
                if (r.ok && r.status === 206 && size && type.startsWith("video")) {
                    return r.blob().then(blob => ({ blob, size }))
                } else showError(errMsg)
            })
            .catch(() => showError(errMsg))
            .finally(() => setLoading(false));

        if (!resp) return;

        const { blob, size } = resp;
        const thumb = await generateSnapshot(blob)
        const hash = await createThumbHash(thumb);

        setFrame({
            blob: null,
            isExternal: true,
            path,
            shouldUpload: false,
            size,
            type: "video",
            hash,
            thumb,
        })
    }

    if (loading) return (
        <section className="h-40">
            <span className="size-10 border-2 border-invert border-b-transparent animate-spin"></span>
        </section>
    )

    return (
        <section className="p-4">
            <div className="text-center text-zinc-500 space-y-2">
                <p>We{"'"}re working on video upload. We support Mega Uploads.</p>
                <p>You can upload videos on Mega and paste the link here.</p>
                <p>Or you can upload videos elsewhere and attach the link using Link Prompt.</p>
            </div>

            <Form schema={{ url: megaFileSchema }} submit={attachVideo}>
                <Input
                    name="url"
                    placeholder="https://mega.nz/file/{id}#{key}"
                    description="Make sure key is attached with the url"
                />
                <button
                    type="submit"
                    className="primary w-full mt-4 sm:w-fit sm:mx-auto"
                >
                    Attach
                </button>
            </Form>
        </section>
    )

}

const SectionNav = ({ section, setSection }: { section: MediaType, setSection: TypedFunction<MediaType> }) => (
    <ul className="flex">
        {(["image", "video"] as MediaType[]).map(el => (
            <li
                key={el}
                onClick={() => setSection(el)}
                className={`flex-1 py-2 text-center border-b capitalize ${section === el ? "border-invert" : "border-transparent"}`}
            >
                {el}
            </li>
        ))}
    </ul>
)

export const MediaInputPrompt = ({ type, callback }: { type: "image" | "both", callback: TypedFunction<[FrameToReturn]> }) => {

    const [frame, setFrame] = useState<FrameToReturn | null>(null);
    const [section, setSection] = useState<MediaType>("image");

    const returnMedia = () => {
        if (!frame) return;
        callback(frame);
        setFrame(null);
    }

    const removeFrame = (error?: boolean) => {
        setFrame(null);
        if (error) showError("Unsupported Media or Internet Connection Problem! Please try again");
    }

    if (frame) return (
        <section className="space-y-4 p-4">

            <FrameContainer {...frame} />

            <div className="flex gap-2 flex-cntr-all">
                <button className="flex-1 sm:flex-0 secondary" onClick={() => removeFrame()}>Cancel</button>
                <button className="flex-1 sm:flex-0 secondary" onClick={returnMedia}>Add</button>
            </div>
        </section>
    )

    if (section === "video" && type === "both") return (
        <section className="space-y-2">
            <SectionNav section={section} setSection={setSection} />
            <VideoUploader setFrame={setFrame} />
        </section>
    )

    return (
        <section className="space-y-2">
            {type === "both" && (
                <SectionNav section={section} setSection={setSection} />
            )}
            <ImageUploader setFrame={setFrame} />
        </section>
    )
}

type ManagerProps = {
    title?: string,
    limit?: number,
    allowBoth?: true,
    defaultFrames?: InputFrame[],
};

const MediaInputManager = forwardRef<InputManagerType<InputFrame[]>, ManagerProps>(({ title, limit, allowBoth, defaultFrames }: ManagerProps, ref) => {

    const [frames, setFrames] = useState<FrameToReturn[]>(defaultFrames ?? []);
    const sheetRef = useRef<BottomSheetRef>();
    const [frameType, setFrameType] = useState<"image" | "both">(allowBoth ? "both" : "image");

    const getFrames = () => {
        return frames.map(frame => {
            const { thumb, ...rest } = frame;
            return rest;
        })
    }

    useImperativeHandle(ref, () => ({ getData: getFrames }));

    const getframe = (frame: InputFrame) => {

        if (frames.length >= (limit ?? 1)) return;

        else if (frames.findIndex(f => f.path === frame.path) > -1) {
            toast.error("Duplicate Frame removed!");
            return;
        }

        else if (frame.type === "video") {
            const mediaUploadedVideoFramesCount = frames.filter(el => el.type === "video" && !el.isExternal).length;
            if (mediaUploadedVideoFramesCount + 1 === numberOfFrames.videos)
                setFrameType("image");
            else if (mediaUploadedVideoFramesCount + 1 > numberOfFrames.videos) {
                toast.error("No more media uploaded videos allowed!");
                return;
            }
        }

        setFrames([...frames, frame]);
    }

    const removeframe = (path: string) => {
        setFrames(frames.filter(el => el.path !== path));
    }

    return (
        <div className="space-y-4">

            <div className="flex flex-cntr-between">
                <h4 className="capitalize">{title ?? "Attach frames"}</h4>
            </div>

            <div className="flex gap-2 overflow-x-auto noScroll">

                {frames.map(frame => (
                    <FrameContainer {...frame} remove={removeframe} key={frame.path} />
                ))}

                {frames.length < (limit ?? 1) && (
                    <BottomSheet
                        ref={sheetRef}
                        button={
                            <div className="size-60 rounded-md border-dashed border border-gray40 aspect-square backdrop:brightness-50 flex flex-cntr-all">
                                <AddIcon />
                            </div>
                        }>
                        <MediaInputPrompt callback={getframe} type={frameType} />
                    </BottomSheet>
                )}
            </div>
        </div>
    )
});

MediaInputManager.displayName = "MediaInputManager";

export default MediaInputManager;