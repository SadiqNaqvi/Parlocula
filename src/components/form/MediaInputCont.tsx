"use client";

import { AddIcon, XmarkIcon } from "@assets/Icons";
import logo from "@assets/logo.png";
import Modal, { CloseButton } from "@components/Modal";
import { mediaInputConfig, mediaUrlPattern, numberOfFrames } from "@lib/constants";
import { scaleImage } from "@lib/utils";
import { InputManagerType } from "@type/other";
import { InputFrame } from "@type/schemas";
import Image from "next/image";
import { ChangeEvent, forwardRef, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";

type PromptProps = {
    type?: "image" | "both",
    callback: (file: InputFrame) => void,
}

const bothMediaTypeAccept = `${mediaInputConfig.image.accept}, ${mediaInputConfig.video.accept}`;

export const MediaInputPrompt = ({ type, callback }: PromptProps) => {

    const [frame, setFrame] = useState<InputFrame | null>(null);

    const showError = (err: string) => {
        toast.error(err, { duration: 6000 })
    }

    const returnMedia = () => {
        if (!frame) return;
        callback(frame);
        setFrame(null);
    }

    const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file: File = event.target.files[0];

        // Check if the provided frame is valid. 
        const [type, ext] = file.type.split('/');

        if (type !== "image" && type !== "video") return showError(`Invalid Media Type! Only Images and Videos are allowed.`);

        else if (!mediaInputConfig[type].accept.includes(ext)) return showError(`Invalid Media Extention! Please choose a valid ${type}.`);

        else if (file.size > mediaInputConfig[type].size.value) return showError(`${type} is too large in size. Please choose a valid ${type}.`);

        const blob = type === "image" ?
            await scaleImage(file) :
            new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });

        if (!blob) return showError("Unable to parse image. Please try again.");
        setFrame({ type, path: URL.createObjectURL(blob), blob, isExternal: false, shouldUpload: true });
    }

    const getMediaTypeFromUrl = (url: string) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];

        const extension = url.split('.').pop()?.toLowerCase().split(/[?#]/)[0];

        if (!extension) return;

        else if (imageExtensions.includes(extension)) {
            return 'image';
        } else if (videoExtensions.includes(extension)) {
            return 'video';
        } else {
            return;
        }
    }

    const uploadMediaUrl = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const url = e.target.url?.value?.trim().toLowerCase();
        if (!url) return;

        else if (!mediaUrlPattern.test(url))
            return showError("Invalid URL! Fix: Include 'https' or media extension not supported");

        const media_type = getMediaTypeFromUrl(url);
        if (!media_type) return showError("Invalid Extension! Please provide a valid image/video type.")

        setFrame({ blob: null, isExternal: true, type: media_type, path: url, shouldUpload: false });
        e.target.reset();
    }

    const removeFrame = (error?: boolean) => {
        setFrame(null);
        if (error) showError("Unsupported Media or Internet Connection Problem! Please try again");
    }

    return (
        <div className="size-[500px] *:w-full p-4 bg-primarylight rounded-md border flex flex-col justify-evenly border-dashed border-gray-500">
            {frame ?
                <section className="size-full flex flex-col gap-4">
                    <div key={frame.path} className="relative flex-1 mx-auto border border-gray40 rounded-md">
                        {
                            frame.type === "image" ?
                                <img
                                    onError={() => removeFrame(true)}
                                    className="h-full w-full object-contain"
                                    src={frame.path}
                                    alt=""
                                    width={1000} height={1000}
                                />
                                :
                                <video
                                    onError={() => removeFrame(true)}
                                    controls className="size-full object-contain">
                                    <source src={frame.path} />
                                </video>
                        }
                    </div>

                    <div className="flex gap-2">
                        <button className="flex-cntr-all" onClick={() => removeFrame()}>Cancel</button>
                        <CloseButton closeAll className="secondary" onClick={returnMedia}>Add</CloseButton>
                    </div>
                </section>
                :
                <section className="text-zinc-500 text-sm text-center flex flex-cntr-all">

                    <h5 className="text-xl">Click on the popcorn icon to start uploading. </h5>

                    <h6 className="mb-3 mt-6 text-xl">Rules: </h6>
                    <ul className="space-y-2 list-disc">
                        {type === "both" ?
                            <>
                                <li>The size of the chosen image should be less than {mediaInputConfig["image"].size.label}.</li>
                                <li>The size of the chosen video should be less than {mediaInputConfig["video"].size.label}.</li>
                            </>
                            :
                            <li>
                                The size of the image should be less than {mediaInputConfig.image.size.label}.
                            </li>
                        }
                    </ul>

                    <div className="relative w-fit">
                        <Image className="size-8 cursor-pointer object-contain" src={logo} width={50} height={50} alt="" />
                        {type === "both" ?
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0"
                                onChange={handleMediaUpload}
                                accept={bothMediaTypeAccept} />
                            :
                            <input
                                onChange={handleMediaUpload}
                                className="absolute inset-0 opacity-0"
                                title="" type="file"
                                accept={mediaInputConfig.image.accept}
                            />}
                    </div>

                    <span className="text-zinc-500">or</span>

                    <form className="flex-1" onSubmit={uploadMediaUrl}>
                        <input
                            name="url"
                            max={200}
                            type="text"
                            className="noControl outline-none px-2 py-3 text-center placeholder:text-center bg-primary w-full rounded-md"
                            placeholder="Upload using a URL"
                        />
                    </form>
                    <p className="mt-2 text-zinc-500 text-xs text-center">Uploading from URL has no size limit and is recommended for now.</p>
                </section>
            }
        </div>
    )
}

type ManagerProps = {
    title?: string,
    limit?: number,
    allowBoth?: true,
    defaultFrames?: InputFrame[],
};

const MediaInputManager = forwardRef<InputManagerType<InputFrame[]>, ManagerProps>(({ title, limit, allowBoth, defaultFrames }: ManagerProps, ref) => {

    const [frames, setFrames] = useState<InputFrame[]>(defaultFrames ?? []);

    const [frameType, setFrameType] = useState<"image" | "both">(allowBoth ? "both" : "image");

    useImperativeHandle(ref, () => ({
        getData: () => frames,
    }));

    const getframes = (frame: InputFrame) => {
        if (frames.length >= (limit ?? 1)) return;

        else if (frames.find(f => f.path === frame.path)) {
            toast.error("Duplicate Frame removes!");
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

    const removeframes = (path: string) => {
        setFrames(frames.filter(el => el.path !== path));
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-cntr-between">
                <h4 className="capitalize">{title ?? "Attach frames"}</h4>
            </div>
            <div className="flex gap-2 overflow-x-auto noScroll">
                {frames.map(frame => (
                    <div className="size-60 border rounded-md border-gray40 relative">
                        {
                            frame.type === "image" ?
                                <img
                                    className="aspect-square h-full object-contain"
                                    src={frame.path}
                                    alt=""
                                    width={1000} height={1000}
                                />
                                :
                                <video className="size-full object-contain">
                                    <source src={frame.path} />
                                </video>
                        }
                        <button
                            onClick={() => removeframes(frame.path)}
                            className="absolute smallBtn p-1 right-0 top-0 mt-1 mr-1 bg-gray30 border border-gray40 rounded-md">
                            <XmarkIcon className="h-4" />
                        </button>
                    </div>
                ))}

                {frames.length < (limit ?? 1) && (
                    <Modal id="frame-input" buttonChildren={
                        <div className="size-60 rounded-md border-dashed border border-gray40 aspect-square backdrop:brightness-50 flex flex-cntr-all">
                            <AddIcon />
                        </div>
                    }
                        className={`iconBtn ${frames.length >= (limit ?? 1) ? "fadeToNone" : ""}`}>
                        <MediaInputPrompt callback={getframes} type={frameType} />
                    </Modal>
                )}
            </div>
            <p className="text-sm text-zinc-500 text-center">Only {numberOfFrames.videos} media uploaded videos are allowed for now.</p>
        </div>
    )
});

export default MediaInputManager;