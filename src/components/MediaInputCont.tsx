"use client";

import { XmarkIcon } from "@assets/Icons";
import logo from "@assets/logo.png";
import { mediaUrlPattern, numberOfFrames } from "@lib/constants";
import { useCustomReducer } from "@lib/hooks";
import { scaleImage } from "@lib/utils";
import { InputFrame } from "@type/schemas";
import Image from "next/image";
import { ChangeEvent } from "react";
import { CloseButton } from "./Modal";

type MediaInputType = {
    type: "image" | "video",
    multiple?: number,
    callback: (file: InputFrame[]) => void,
    defaultFrames?: InputFrame[],
}

const MediaInputCont = ({ type, multiple = 0, callback, defaultFrames }: MediaInputType) => {

    const {
        error,
        frames,
        noOfVideos,
        setter
    } = useCustomReducer({
        error: "",
        noOfVideos: 0,
        frames: defaultFrames ?? []
    });

    const inputConfig: Record<"image" | "video", { accept: string, size: { label: string, value: number } }> = {
        "image": { accept: ".jpg, .png, .jpeg, .webp, .avif", size: { label: "3mb", value: 1024 * 1024 * 3 } },
        "video": { accept: ".mp4, .3gp, .mkv, .mov, .m4v", size: { label: "10mb", value: 1024 * 1024 * 10 } }
    }

    const setError = (err: string) => {
        setter({ error: err });
        setTimeout(() => setter({ error: "" }), 5000);
    }

    const returnMedia = () => {
        callback(frames);
        // setter({ frames: [] });
    }

    const isFrameValid = (frame: File) => {
        const [type, ext] = frame.type.split('/');
        if (type !== "image" && type !== "video") return setError(`Invalid Media Type! Only Images and Videos are allowed.`);
        if (!inputConfig[type].accept.includes(ext)) return setError(`Invalid Media Extention! Please choose a valid ${type}.`);
        else if (frame.size > inputConfig[type].size.value) return setError(`${type} is too large in size. Please choose a valid ${type}.`);
        else return true;
    }

    const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file: File = event.target.files[0];

        // Check if the provided frame is valid. 
        if (!isFrameValid(file)) return;
        else if (frames.length >= numberOfFrames.total)
            return setError(`Only ${numberOfFrames.total} frames are allowed`);
        else if (type === "video" && noOfVideos >= numberOfFrames.videos)
            return setError(`Only ${numberOfFrames.videos} device uploaded videos are allowed. Use URL based upload for more videos.`);

        const blob = type === "image" ?
            await scaleImage(file) :
            new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });

        if (!blob) return setError("Unable to parse image. Please try again.");
        setter({ frames: [{ type, path: URL.createObjectURL(blob), blob, isExternal: false, shouldUpload: true }], noOfVideos: noOfVideos + (type === "video" ? 1 : 0) });

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
            return setError("Invalid URL! Fix: Include 'https' or media extension not supported");
        else if (frames.find(el => el.path === url)) return;

        const media_type = getMediaTypeFromUrl(url);
        if (!media_type) return setError("Invalid Extension! Please provide a valid image/video type.")

        else if (!multiple && media_type !== type)
            return setError(`Invalid Media! Please provide a valid ${type}.`)

        if (multiple) setter({ frames: [...frames, { blob: null, isExternal: true, type: media_type, path: url, shouldUpload: false }] })
        else setter({ frames: [{ blob: null, isExternal: true, type: media_type, path: url, shouldUpload: false }] })
        e.target.reset();
    }

    const handleFrames = async (event: ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = event.target.files;
        if (!files || !files.length) return;
        if ((frames.length + files.length) > numberOfFrames.total)
            return setError(`Only ${numberOfFrames.total} frames are allowed for now.`);

        let videos = noOfVideos; let excluded = 0;
        const tempFrames = frames;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isValid = isFrameValid(file);
            if (!isValid) {
                excluded++;
                continue;
            }

            else if (file.type.split('/')[0] === "image") {
                const blob = await scaleImage(file);
                if (!blob) continue;
                tempFrames.push({ path: URL.createObjectURL(blob), type: "image", isExternal: false, blob, shouldUpload: true });
            }

            else {
                if (videos >= numberOfFrames.videos) {
                    excluded++;
                    continue;
                }
                videos++;
                const blob = new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
                tempFrames.push({ path: URL.createObjectURL(blob), type: "video", isExternal: false, blob, shouldUpload: true });
            }
        }
        excluded && setError(`${excluded} frames are excluded from the chosen frames since you've voilated the rules.`)
        setter({ frames: tempFrames, noOfVideos: videos });
    }

    const removeFrame = (ind: number) => {
        setter({ frames: frames.filter((_, i) => i !== ind) });
    }


    return (
        <div className="size-[500px] *:w-full p-4 bg-primarylight rounded-md border flex flex-col justify-evenly border-dashed border-gray-500">
            {!!frames.length ?
                <section className="flex-1 max-h-[80%] flex overflow-x-auto gap-4">
                    {frames.map((frame, ind) => (
                        <div key={frame.path} className="relative aspect-square h-full mx-auto border border-gray40 rounded-md">
                            {
                                frame.type === "image" ?
                                    <img
                                        className="aspect-square h-full object-contain"
                                        src={frame.path}
                                        alt=""
                                        width={1000} height={1000}
                                    />
                                    :
                                    <video controls className="size-full object-contain">
                                        <source src={frame.path} />
                                    </video>
                            }
                            <button
                                onClick={() => removeFrame(ind)}
                                className="absolute smallBtn p-1 right-0 top-0 mt-1 mr-1 bg-gray30 border border-gray40 rounded-md">
                                <XmarkIcon className="h-4" />
                            </button>
                        </div>
                    ))}
                </section>
                :
                <ul className="space-y-3 text-zinc-500 text-sm text-center">
                    <li>Click on the popcorn icon to start uploading. </li>
                    {multiple ?
                        <>
                            <li>
                                Rules: The size of the images should be less than {inputConfig["image"].size.label} and the videos should be less than {inputConfig["video"].size.label}. Only {numberOfFrames.videos} videos are allowed for now.
                            </li>
                        </>
                        :
                        <li>
                            The size of the chosen {type} should be less than {inputConfig[type].size.label}.
                        </li>
                    }
                </ul>
            }
            <section>
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <Image className="size-8 cursor-pointer object-contain" src={logo} width={50} height={50} alt="" />
                        {multiple ?
                            <input
                                disabled={frames.length >= numberOfFrames.total}
                                type="file"
                                multiple
                                className="absolute inset-0 opacity-0"
                                onChange={handleFrames}
                                accept=".jpg, .png, .jpeg, .webp, .avif, .mp4, .3gp, .mkv, .mov, .m4v" />
                            :
                            <input
                                disabled={frames.length >= numberOfFrames.total}
                                onChange={handleMediaUpload}
                                className="absolute inset-0 opacity-0"
                                title="" type="file"
                                accept={inputConfig[type].accept}
                            />}
                    </div>
                    <span className="text-zinc-500">or</span>
                    <form className="flex-1" onSubmit={uploadMediaUrl}>
                        <input
                            disabled={frames.length >= numberOfFrames.total}
                            name="url"
                            max={200}
                            type="text"
                            className="noControl outline-none px-2 py-3 text-center placeholder:text-center bg-primary w-full rounded-md"
                            placeholder="Upload using a URL"
                        />
                    </form>

                    {Boolean(frames.length) &&
                        <div className="flex gap-2">
                            <button className="flex-cntr-all" onClick={() => setter({ frames: [] })}>Cancel</button>
                            <CloseButton className="secondary" onClick={returnMedia}>Add</CloseButton>
                        </div>
                    }
                </div>
                {Boolean(!frames.length) &&
                    <p className="mt-2 text-zinc-500 text-xs text-center">Uploading from URL has no size limit and is recommended for now.</p>
                }

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </section>
        </div>
    )
}

export default MediaInputCont;