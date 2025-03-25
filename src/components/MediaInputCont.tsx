import { CheckIcon, XmarkIcon } from "@assets/Icons";
import Image from "next/image"
import logo from "@assets/logo.png"
import React, { ChangeEvent } from "react";
import { useCustomReducer } from "@lib/hooks";
import { scaleImage } from "@lib/utils";
import { allowedFormats, numberOfFrames, urlPattern } from "@lib/constants";
import { InputFrame } from "@type/internal";

type MediaInputType = { type: "image" | "video", multiple?: number, callback: (file: InputFrame[]) => void } & React.HTMLAttributes<HTMLElement>

const MediaInputCont = ({ type, multiple = 0, callback, ...args }: MediaInputType) => {

    const {
        error,
        frames,
        setter
    } = useCustomReducer<{
        error: string,
        frames: InputFrame[]
    }>({
        error: "",
        frames: []
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
        setter({ frames: [] });
    }

    const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file: File = event.target.files[0];
        if (file.size > inputConfig[type].size.value) {
            setError(`${type} is too large in size. Please choose a valid ${type}.`)
            return;
        }
        if (type === "image") {
            const blob = await scaleImage(file);
            if (!blob) {
                setError("Unable to parse image. Please try again.");
                return;
            }
            setter({ frames: [{ type: "image", url: URL.createObjectURL(blob), blob, isExternal: false, size: blob.size }] });
        }
        else {
            const blob = new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
            setter({ frames: [{ type: "video", url: URL.createObjectURL(blob), blob, isExternal: false, size: blob.size }] });
        }
    }

    const uploadMediaUrl = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const url = e.target.url.value.trim().toLowerCase();
        if (!url) return;

        if (!urlPattern.test(url)) return setError("Invalid URL! Please provide a valid URL with 'https'");

        const extension = url.split('.').pop();
        if ((type === "image" && !allowedFormats.image.includes(extension)) ||
            (type === "video" && !allowedFormats.video.includes(extension))) {
            return setError("Invalid Format! Only listed formats are allowed");
        }

        try {
            const resp = await fetch(url, { method: "HEAD" });
            const contentType = resp.headers.get("Content-Type");
            const contentSize = parseInt(resp.headers.get("Content-Length") || "");

            if (!contentType || !contentSize || isNaN(contentSize))
                return setError("Unable to fetch media. Please check the URL and try again.");

            const mediaType = contentType.split("/")[0];
            if (!["image", "video"].includes(mediaType))
                return setError("Invalid Media Type! Only images and videos are allowed.");

            const maxSize: Record<string, number> = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 }; // 10MB, 100MB
            if (contentSize > maxSize[mediaType]) {
                return setError(`The ${mediaType} is too large. Use a media hosting site and attach the link.`);
            }

            setter({ frames: [{ blob: null, isExternal: true, type: mediaType as "image" | "video", size: contentSize, url }] });
        } catch {
            setError("Failed to fetch media. Please check your connection and try again.");
        }

    }

    const isFrameValid = (frame: File) => {
        const [type, ext] = frame.type.split('/');
        if (type !== "image" && type !== "video") return false;
        if (!inputConfig[type].accept.includes(ext)) return false;
        else if (frame.size > inputConfig[type].size.value) return false;
        else return true;
    }

    const handleFrames = async (event: ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = event.target.files;
        if (!files || !files.length) return;
        if (files.length > numberOfFrames.total) {
            setError(`You can only choose ${numberOfFrames.total} frames`);
            return;
        }
        let videos = 0; let excluded = 0;
        const frames: InputFrame[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isValid = isFrameValid(file);
            if (!isValid) {
                excluded++;
                continue;
            }
            if (file.type.split('/')[0] === "image") {
                const blob = await scaleImage(file);
                if (!blob) {
                    setError("Unable to parse image. Please try again.");
                    continue;
                }
                frames.push({ url: URL.createObjectURL(blob), type: "image", isExternal: false, blob, size: blob.size });
            }
            else {
                if (videos >= numberOfFrames.videos) {
                    excluded++;
                    continue;
                }
                videos++;
                const blob = new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
                frames.push({ url: URL.createObjectURL(blob), type: "video", isExternal: false, blob, size: blob.size });
            }
        }
        excluded && setError(`${excluded} frames are excluded from the chosen frames since you've voilated the rules.`)
        setter({ frames });
    }

    const removeFrame = (ind: number) => {
        setter({ frames: frames.filter((_, i) => i !== ind) });
    }

    //We can take multiple files from inputs but not from urls. I need to implement a way to take multiple files from urls.


    return (
        <section {...args} className="bg-transparent text-inherit max-w-full">
            <div className="size-[26rem] max-w-full p-4 bg-primarylight rounded-md border flex flex-col flex-cntr-all border-dashed border-gray-500">
                {!!frames.length ?
                    <>
                        <div className="h-[80%] w-full flex overflow-x-auto gap-4">
                            {frames.map((frame, ind) => (
                                <div key={frame.url} className="relative aspect-square h-full mx-auto border border-gray40 rounded-md">
                                    {
                                        frame.type === "image" ?
                                            <Image
                                                className="aspect-square h-full object-contain"
                                                src={frame.url}
                                                alt=""
                                                width={1000} height={1000}
                                            />
                                            :
                                            <video controls className="size-full object-contain">
                                                <source src={frame.url} />
                                            </video>
                                    }
                                    <button
                                        onClick={() => removeFrame(ind)}
                                        className="absolute smallBtn p-1 right-0 top-0 mt-1 mr-1 bg-gray30 border border-gray40 rounded-md">
                                        <XmarkIcon classnames="h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex w-full gap-4 justify-end mt-4">
                            <button onClick={() => setter({ frames: [] })}>Cancel</button>
                            <button className="secondary" onClick={returnMedia}>Add</button>
                        </div>
                        <p className="mt-3 text-sm text-red-500">{error}</p>
                    </>
                    :
                    <>
                        <div className="relative">
                            <Image className="size-12 cursor-pointer object-contain" src={logo} width={50} height={50} alt="" />
                            {multiple ?
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 opacity-0"
                                    onChange={handleFrames}
                                    accept=".jpg, .png, .jpeg, .webp, .avif, .mp4, .3gp, .mkv, .mov, .m4v" />
                                :
                                <input
                                    onChange={handleMediaUpload}
                                    className="absolute inset-0 opacity-0"
                                    title="" type="file"
                                    accept={inputConfig[type].accept}
                                />}
                        </div>
                        {multiple ?
                            <>
                                <p className="mt-4 text-sm text-zinc-500">Click on the popcorn above to start uploading frames. </p>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Rules: The size of the images should be less than {inputConfig["image"].size.label} and the videos should be less than {inputConfig["video"].size.label}. Only {numberOfFrames.videos} videos are allowed for now.
                                </p>
                            </>
                            :
                            <p className="mt-4 text-zinc-500 text-center">
                                Click on the popcorn above to upload {type === "image" ? "an image" : "a video"}. The size of the chosen {type} should be less than {inputConfig[type].size.label}.
                            </p>
                        }
                        <p className="mt-4 text-zinc-500">or</p>
                        <form className="mt-4 flex gap-3 w-full" onSubmit={uploadMediaUrl}>
                            <input
                                name="url"
                                max={100}
                                type="text"
                                className="noControl outline-none px-2 py-3 text-center placeholder:text-center bg-primary flex-1 rounded-md"
                                placeholder="Upload using a URL"
                            />
                            <button className="iconBtn mx-2" type="submit">
                                <CheckIcon />
                            </button>
                        </form>
                        <p className="mt-2 text-zinc-500 text-sm text-center">Uploading from URL has no size limit and is recommended for now.</p>
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    </>
                }
            </div>
        </section>
    )
}

export default MediaInputCont;