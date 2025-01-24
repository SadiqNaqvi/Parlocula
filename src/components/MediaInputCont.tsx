import { CheckIcon } from "@assets/Icons";
import Image from "next/image"
import logo from "@assets/logo.png"
import React, { ChangeEvent } from "react";
import { useCustomReducer } from "@lib/hooks";
import { scaleImage } from "@lib/utils";
import { urlPattern } from "@lib/constants";

const MediaInputCont = ({ type, callback, ...args }: { type: "image" | "video", callback: (file: Blob | string) => void } & React.HTMLAttributes<HTMLElement>) => {

    const {
        error,
        url,
        preview,
        returnBlob,
        setter
    } = useCustomReducer<{ url: string, error: string, preview: string, returnBlob: Blob | null }>({
        url: "",
        error: "",
        preview: "",
        returnBlob: null
    });

    const inputConfig: Record<string, any> = {
        "image": { accept: ".jpg, .png, .jpeg, .webp, .avif", size: { label: "3mb", value: 1024 * 1024 * 3 } },
        "video": { accept: ".mp4, .3gp, .mkv, .mov", size: { label: "10mb", value: 1024 * 1024 * 10 } },
    }

    const setError = (err: string) => {
        setter({ error: err });
        setTimeout(() => setter({ error: "" }), 5000);
    }

    const returnMedia = () => {
        callback(returnBlob ?? preview);
        setter({ url: "", preview: "", error: "", returnBlob: null });
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
            setter({ preview: URL.createObjectURL(blob), returnBlob: blob });
        }
        else {
            const blob = new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
            setter({ preview: URL.createObjectURL(blob), returnBlob: blob });
        }
    }

    const uploadMediaUrl = async () => {
        if (!urlPattern.test(url)) {
            setError("Invalid URL! Please provide a valid URL with 'https'");
            return;
        };
        try {
            // Fetch the image as a blob to get its size
            const response = await fetch(url, { method: "HEAD" });

            if (!response.ok) {
                setError(`Failed to fetch the ${type} from the url.`);
            }

            // const contentLength = response.headers.get("content-length");
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes(type) || !inputConfig[type].accept.includes(contentType.split('/')[1])) {
                setError(`Invalid ${type}. Only '${inputConfig[type].accept}' are allowed`);
                return;
            }

            setter({ preview: url });

        } catch (error) {
            setError(`Failed to fetch ${type}. Please try again.`);
        }
        // callback(url)
        // console.log(url);
    }

    return (
        <section {...args} className="bg-transparent text-inherit max-w-full">
            <div className="size-[26rem] max-w-full p-4 bg-primarylight rounded-md border flex flex-col flex-cntr-all border-dashed border-gray-500">
                {preview ?
                    <>
                        {type === "image" ?
                            <Image
                                className="w-full h-[80%] object-contain"
                                src={preview}
                                alt=""
                                width={1000} height={1000}
                            />
                            :
                            <video className="w-full h-[80%] object-contain">
                                <source src={preview} />
                            </video>
                        }
                        <div className="flex w-full gap-4 justify-end mt-4">
                            <button onClick={() => setter({ preview: "" })}>Cancel</button>
                            <button className="secondary" onClick={returnMedia}>Add</button>
                        </div>
                    </>
                    :
                    <>
                        <div className="relative">
                            <Image className="size-12 cursor-pointer object-contain" src={logo} width={50} height={50} alt="" />
                            <input
                                onChange={handleMediaUpload}
                                className="absolute inset-0 opacity-0"
                                title="" type="file"
                                accept={inputConfig[type].accept}
                            />
                        </div>
                        <p className="mt-4 text-zinc-500 text-center">
                            Click on the popcorn above to upload {type === "image" ? "an image" : "a video"}. The size of the chosen {type} should be less than {inputConfig[type].size.label}.
                        </p>
                        <p className="mt-4 text-zinc-500">or</p>
                        <div className="mt-4 flex gap-3 w-full">
                            <input
                                value={url}
                                onChange={e => setter({ url: e.target.value })}
                                type="text"
                                className="noControl outline-none px-2 py-3 text-center placeholder:text-center bg-primary flex-1 rounded-md"
                                placeholder="Upload using a URL"
                            />
                            <button className="iconBtn mx-2" disabled={!url} onClick={uploadMediaUrl}>
                                <CheckIcon />
                            </button>
                        </div>
                        <p className="mt-2 text-zinc-500 text-sm text-center">Uploading from URL is recommended for now.</p>
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    </>
                }
            </div>
        </section>
    )
}

export default MediaInputCont;