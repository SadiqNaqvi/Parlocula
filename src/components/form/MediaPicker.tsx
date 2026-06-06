"use client";

import { AddIcon, GlobeIcon, LeftChevron, MegaIcon, VimeoIcon, XmarkIcon, YoutubeIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef, NestedSheet } from "@components/BottomSheet";
import { Button, LoadingSpinner, OptionalChildren } from "@components/ui";
import { mediaInputConfig, mediaUrlPattern, numberOfFrames, vimeoLinkPattern, youtubeLinkPattern } from "@lib/constants";
import { createThumbHash, scaleImage, convertByteIntoSize } from "@lib/helpers/media";
import appToast from "@lib/providers/toast";
import { fileSchema, megaFileSchema, urlSchema } from "@lib/schemas";
import { Frame } from "@type/internal";
import { InputManagerType, TypedFunction } from "@type/other";
import { ExtMediaSource, InputFrame } from "@type/schemas";
import Image from "next/image";
import { ChangeEvent, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { Form, Input } from ".";

type FrameToReturn = InputFrame & { thumb?: string }

type Sections = "all" | ExtMediaSource;

const showError = (err: string) => {
    appToast.error(err)
}

const FrameContainer = ({ path, type, size, thumb, remove, className }: FrameToReturn & { remove?: TypedFunction<string>, className?: string }) => {

    const ExtraComponents = () => (
        <>
            <OptionalChildren condition={remove}>
                <Button
                    id="frame-remove"
                    title="Remove Frame"
                    onClick={() => remove?.(path)}
                    className="absolute smallBtn p-1 right-0 top-0 mt-1 mr-1 bg-black/50 text-white border border-gray40 rounded-md">
                    <XmarkIcon className="h-4" />
                </Button>
            </OptionalChildren>
            <OptionalChildren condition={size}>
                <span className="absolute bottom-0 right-0 mr-2 mb-2 bg-black/50 text-sm text-white rounded-md p-1">
                    {convertByteIntoSize(size || 0)}
                </span>
            </OptionalChildren>
        </>
    )

    if (type === "image" || thumb) return (
        <div className={twMerge("min-w-60 size-60 border rounded-md border-gray40 relative", className)}>
            <Image
                className="aspect-square h-full object-contain"
                src={thumb || path}
                alt="Chosen Frame"
                width={240} height={240}
            />
            <ExtraComponents />
        </div>
    )

    else return (
        <div className={twMerge("min-w-60 size-60 border rounded-md border-gray40 relative", className)}>
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

const UploadFromRest = ({ setUrl, goBack, section }: { setUrl: TypedFunction<string>, section: Sections, goBack: TypedFunction }) => {

    const handleSubmit = async ({ url }: { url: string }) => {
        if (section === "web") {
            if (mediaUrlPattern.test(url))
                setUrl(url);
            else return "Invalid Link! Make sure it contains https"
        }
        else {
            const { success, error } = urlSchema.safeParse(url);
            if (!success) return error.issues[0]?.message;
            else if ((section === "youtube" && !youtubeLinkPattern.test(url)) || (section === "vimeo" && !vimeoLinkPattern.test(url)))
                return `Invalid Url! Please provide a valid ${section} shareable url.`
        }

        setUrl(url);
    }

    return (
        <div className="px-2">
            <header>
                <div className="mx-auto flex gap-2 items-center">
                    <Button
                        id="back-button"
                        title="Go Back"
                        onClick={goBack}
                    >
                        <LeftChevron />
                    </Button>
                    <h4 className="text-lg capitalize">Upload from {section}</h4>
                </div>
                <p className="text-sm text-center">Just copy the link of the content and past it here. Simple</p>
            </header>

            <Form className="mt-4" submit={handleSubmit}>
                <Input
                    name="url"
                    placeholder="Paste the link here..."
                    description={section === "web" ? "Make sure it is the link of the content, not the page" : undefined}
                />

                <Button
                    id="submit"
                    title="Upload"
                    type="submit"
                    className="primary mt-3 w-full"
                >
                    Upload
                </Button>
            </Form>

        </div>
    )

}

const UploadFromMega = ({ setUrl, goBack }: { setUrl: TypedFunction<string>, goBack: TypedFunction }) => {

    const handleSubmit = async ({ url }: { url: string }) => {
        const { success, data, error } = megaFileSchema.safeParse(url);
        console.log(success, data, error)
        if (success) setUrl(data);
        else return error.issues[0].message;
    }

    return (
        <section className="px-2">
            <div>
                <div className="mx-auto flex gap-2 items-center">
                    <Button
                        id="back"
                        title="Go Back"
                        onClick={goBack}
                    >
                        <LeftChevron />
                    </Button>
                    <h4 className="text-lg">Upload from Mega</h4>
                </div>
                <p className="text-sm text-center">This is the best way to upload large videos and images here. Just upload your file on Mega and drop the link here.</p>
            </div>

            <Form className="mt-4" submit={handleSubmit}>
                <Input
                    name="url"
                    placeholder="https://mega.nz/file/{id}#{key}"
                    description="Make sure key is attached with the url"
                />

                <Button
                    id="submit"
                    title="Upload"
                    type="submit"
                    className="primary mt-3 w-full"
                >
                    Upload
                </Button>
            </Form>

        </section>
    )

}

type URLUploadOption = { icon: React.ReactNode, label: string, id: Sections };

const videoUrlUploadOptions: URLUploadOption[] = [
    { icon: <YoutubeIcon className="size-6" />, label: "Youtube", id: "youtube" },
    { icon: <VimeoIcon className="size-6" />, label: "Vimeo", id: "vimeo" },
];

const imageUrlUploadOptions: URLUploadOption[] = [
    { icon: <MegaIcon className="size-6" />, label: "Mega", id: "mega" },
    { icon: <GlobeIcon className="size-6" />, label: "Other", id: "web" }
];

const combineUploadOptions = videoUrlUploadOptions.concat(imageUrlUploadOptions);

type MediaCheckedResponse<T = any> = { success: boolean, error: string, result: T };
type MegaAndWebResponse = { size: number, mime: "image" | "video", ext: string, hash: string };

const checkMediaLink = async <T,>(url: string, returnBoolean?: boolean): Promise<T | undefined | boolean> => {

    const resp = await fetch(url);
    console.log("response", resp.ok, resp.status, resp.statusText);
    const { error, result, success } = await resp.json() as MediaCheckedResponse<T>;

    if (resp.ok && success) return returnBoolean ? true : result as T;

    else if (resp.status === 404)
        showError("Nothing could be found! Please check the link and try again.")

    else {
        console.error("Error while checking link", resp.status, resp.statusText, error);
        showError("Something went wrong! Please try again.")
    }
}

const checkMegaLink = async (url: string) => {
    const idWithKey = url.split('/').at(-1);
    const [id, key] = idWithKey?.split('#') || [];

    if (!id || !key) {
        return showError("Invalid URL! Please provide a valid mega url with key attached");
    }

    const result = await checkMediaLink<MegaAndWebResponse>(`/api/v1/checkMediaUrl?source=mega&path=${id}&key=${key}`);

    if (result && typeof result !== "boolean") return { path: `${id}?key=${key}`, type: result.mime, size: result.size, hash: result.hash }
}

export const MediaInputPrompt = ({ type, callback }: { type: "image" | "both", callback: TypedFunction<[FrameToReturn]> }) => {

    const [frame, setFrame] = useState<FrameToReturn | null>(null);
    const [section, setSection] = useState<Sections>("all");
    const [loading, setLoading] = useState(false);

    const handleUploadFromUrl = async (url: string) => {
        setLoading(true);

        let path = '', thumb = '', hash: string | undefined, mediaType: InputFrame["type"] = 'image', size = 0;

        const apiPath = `/api/v1/checkMediaUrl?source=${section}`;

        try {
            if (section === "mega") {
                const resp = await checkMegaLink(url);
                if (!resp) return;

                path = `https://qcorecloud.vercel.app/media/v1/mega/${resp.path}`;
                size = resp.size;
                mediaType = resp.type;
                hash = resp.hash;
            } else if (section === "web") {
                const resp = await checkMediaLink<MegaAndWebResponse>(`${apiPath}&path=${url}`);
                if (!resp || typeof resp === "boolean") return;

                path = url;
                size = resp.size;
                mediaType = resp.mime;
                hash = resp.hash;
            } else if (section === "youtube") {
                const resp = await checkMediaLink<{ thumbnail_url: string }>(`${apiPath}&path=${url}`);
                if (!resp || typeof resp === "boolean") return;
                const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);

                const video_id = match && match[7];

                if (!video_id || video_id.length !== 11) return showError("Invalid Url!");
                path = video_id;
                thumb = resp.thumbnail_url;
                mediaType = "video";
            } else if (section === "vimeo") {
                const id = url.split('/').at(-1);
                if (!id) return showError("Invalid url! Please choose a valid vimeo url");

                const resp = await checkMediaLink(`${apiPath}&path=${url}`, true);
                if (!resp) return;

                path = id;
                thumb = `https://vumbnail.com/${id}.jpg`;
                mediaType = "video";
            } else if (section === "all") return;

            if (mediaType !== "video" && mediaType !== "image")
                return showError("Invalid Media Type! Only Images and Videos are allowed.")

            else if (type === "image" && mediaType === "video")
                return showError("Invalid Media Type! Only Images are allowed.")

            setFrame({ blob: null, isExternal: true, path: path, hash, shouldUpload: false, type: mediaType, extSource: section, size: size ?? undefined, thumb });
        } catch (e: any) {
            console.warn("Error handling upload from url", e.message);
            showError("Unstable Internet Connection!");
        } finally {
            setLoading(false);
        }
    }

    const handleDeviceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;

        setLoading(true);

        const file: File = event.target.files[0];

        const { success, error } = fileSchema.safeParse(file);

        if (!success) {
            setLoading(false);
            return error.issues.map(err => showError(err.message));
        }

        try {

            let blob: Blob | null = null,
                hash: string | undefined = undefined;

            const fileMime = file.type.split('/')[0]

            if (fileMime === "image") {
                const [scaledImageBlob, imageHash] = await Promise.all([
                    scaleImage(file),
                    createThumbHash(file),
                ]);

                if (!scaledImageBlob) return showError("Failed to upload image! Please try again.");

                blob = scaledImageBlob;
                hash = imageHash;
            } else if (fileMime === "video") {
                if (type === "image") return showError("Upload an image please!")

                blob = new Blob([file], { type: file.type });
                if (!blob) return showError("Failed to upload! Please try again.")
            } else return showError("Invalid file type! Only images and videos are allowed to upload.")

            const path = URL.createObjectURL(blob);

            setFrame({
                type: fileMime,
                size: blob.size,
                path,
                blob,
                isExternal: false,
                shouldUpload: true,
                hash,
            });
        } catch (err: any) {
            console.warn("Error occured while handling media upload:", err.message)
            showError("Something went wrong! Please try again.")
        } finally {
            setLoading(false);
        }
    }

    const changeSectionToAll = () => setSection("all");

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
        <section className="space-y-4 p-4 h-80 max-h-fit">

            <FrameContainer className="mx-auto" {...frame} />

            <div className="flex gap-2 flex-cntr-all">
                <Button
                    id="upload-options-cancel"
                    title="Cancel"
                    className="flex-1 sm:flex-0 secondary"
                    onClick={() => removeFrame()}
                >
                    Cancel
                </Button>
                <Button
                    id="upload-options-add"
                    title="Add"
                    className="flex-1 sm:flex-0 secondary"
                    onClick={returnMedia}
                >
                    Add
                </Button>
            </div>
        </section>
    )

    else if (loading) return (
        <section className="h-64 flex flex-cntr-all">
            <div className="min-w-60 size-60 flex flex-cntr-all border rounded-md border-gray40 relative">
                <span className="size-6 animate-spin border-2 border-gray-500/30 border-l-[var(--secondary)] rounded-full"></span>
                <span className="px-8 py-4 rounded-md absolute bottom-2 right-2 skeletonPulse"></span>
            </div>
        </section>
    )

    else if (section === "mega") return (
        <UploadFromMega goBack={changeSectionToAll} setUrl={handleUploadFromUrl} />
    )

    else if (section === "web" || (type === "both" && (section === "vimeo" || section === "youtube"))) return (
        <UploadFromRest goBack={changeSectionToAll} section={section} setUrl={handleUploadFromUrl} />
    )

    return (
        <section className="px-2">
            <div className="space-y-2">
                <h4 className="parloHeading">Upload from URL</h4>
                <ul className="flex gap-2 overflow-x-auto noScroll">
                    {(type === "image" ? imageUrlUploadOptions : combineUploadOptions).map(({ icon, id, label }) => (
                        <li key={id}>
                            <Button
                                id={`url-upload-options-${id}`}
                                title={label}
                                onClick={() => setSection(id)}
                                className="flex gap-1 items-center p-2 border border-gray40 rounded-md">
                                {icon}
                                <span className="text-sm">{label}</span>
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-8 space-y-2">
                <h4 className="parloHeading">Device Upload</h4>
                <div className="relative pointer">

                    <Button
                        id="device-frame-upload"
                        title="Upload from device"
                        className="primary w-full"
                    >
                        Upload
                    </Button>

                    <input
                        onChange={handleDeviceUpload}
                        className="absolute inset-0 opacity-0"
                        title="" type="file"
                        accept={type === "image" ? mediaInputConfig.image.accept : `${mediaInputConfig.image.accept}, ${mediaInputConfig.video.accept}`}
                    />
                </div>
            </div>
        </section>
    )
}

type ManagerProps = {
    title?: string,
    limit?: number,
    allowBoth?: true,
    defaultFrames?: Frame[];
    className?: string;
    getterRef: React.RefObject<InputManagerType<InputFrame[]> | null>;
    promptRef?: React.RefObject<BottomSheetRef | null>;
};

const convertFrameToInputFrame = (frame: Frame[] | undefined): InputFrame[] => {

    if (!frame) return [];
    return frame?.map(({ hash, path, size, type }) => ({
        blob: null,
        hash,
        isExternal: true,
        path,
        shouldUpload: false,
        size,
        type
    }))
}

const
    MediaInputManager = ({ title, limit = 5, allowBoth, defaultFrames, getterRef, promptRef, className }: ManagerProps) => {

        const [frames, setFrames] = useState<FrameToReturn[]>(convertFrameToInputFrame(defaultFrames));
        const [frameType, setFrameType] = useState<"image" | "both">(allowBoth ? "both" : "image");

        const getFrames = () => {
            return frames.map(frame => {
                const { thumb, ...rest } = frame;
                return rest;
            })
        }

        useImperativeHandle(getterRef, () => ({
            getData: getFrames,
            length: frames.length,
        }));

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

        if (!frames.length) return (
            <NestedSheet ref={promptRef}>
                <MediaInputPrompt callback={getframe} type={frameType} />
            </NestedSheet>
        );

        return (
            <section className={twMerge("space-y-4", className)}>

                <OptionalChildren condition={title}>
                    <h4 className="capitalize">{title}</h4>
                </OptionalChildren>


                <div className="flex gap-2 overflow-x-auto noScroll">

                    <OptionalChildren condition={frames.length < (limit || 1)}>
                        <BottomSheet
                            ref={promptRef}
                            className="size-60 rounded-md border-dashed border border-gray40 aspect-square backdrop:brightness-50 flex flex-cntr-all"
                            button={<AddIcon />}>
                            <MediaInputPrompt callback={getframe} type={frameType} />
                        </BottomSheet>
                    </OptionalChildren>

                    {frames.map(frame => (
                        <FrameContainer {...frame} remove={removeframe} key={frame.path} />
                    ))}
                </div>
            </section>
        )
    }

export default MediaInputManager;