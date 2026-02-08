import { decodeHash } from "@lib/helpers/media";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";
import Image, { ImageLoader } from "next/image";
import { twMerge } from "tailwind-merge";

type FancyProps = {
    gallery?: string;
    fileNameToDownload?: string;
    caption?: string;
    fullSizePath?: string;
}

type Props = {
    frame: Frame | string | undefined,
    className?: string,
    containerClassName?: string,
    height?: number,
    width?: number,
    size?: number,
    alt?: string,
    prioritize?: boolean,
    fancy?: FancyProps;
    loader?: ImageLoader;
}

const getFancyAttributes = (config: FancyProps | undefined, src: string | undefined) => {
    if (!config || !src) return {};
    const { caption, fileNameToDownload, gallery, fullSizePath } = config;
    const source = fullSizePath || src;
    return {
        "data-src": source,
        "data-fancybox": gallery,
        "data-frame": gallery,
        "data-download-src": fileNameToDownload ? source : undefined,
        "data-download-filename": fileNameToDownload,
        "data-caption": caption,
    }
}

// const Fallback = ({ className }: { className?: string }) => (
//     <div className={twMerge("bg-zinc-500 flex rounded-full", className)}>
//         <div className="m-auto w-[50%] max-w-12 aspect-square h-auto border-2 border-invert border-b-transparent rounded-full animate-spin"></div>
//     </div>
// )

// const getImage = async (path: string | undefined): Promise<GeneralGetReturn<string>> => {
//     if (!path) throw new Error("No path provided");

//     try {
//         const blob = await imagePathToBlob(path);
//         const result = URL.createObjectURL(blob);

//         return { success: true, result }
//     } catch (e: any) {
//         console.error("Error occured while fetching image of path", path, "got :", e);
//         return { success: false, errCode: "unknown_error" }
//     }
// }

// const isInternal = (frame: Props["frame"]): frame is Frame => Boolean(frame && typeof frame !== "string");

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, prioritize, fancy, loader }: Props) => {

    const source = !frame ? undefined : typeof frame === "string" ? frame : frame.path;

    const correctWidth = width || size || 50;
    const correctHeight = height || size || 50;

    // if (error) return (
    //     <div className={containerClassName}>
    //         <div
    //             onClick={() => refetch()}
    //             className={twMerge("bg-gray-500 flex flex-cntr-all flex-col", className)}
    //         >
    //             ⚠
    //         </div>
    //     </div>
    // )

    return (
        <div className={containerClassName}>
            <Image
                height={correctHeight}
                width={correctWidth}
                src={getPoster({ path: source })}
                loading={prioritize ? "eager" : "lazy"}
                alt={alt || ""}
                loader={loader}
                // onError={() => setError(true)}
                className={twMerge(`cursor-pointer`, className)}
                blurDataURL={frame && typeof frame !== "string" ? decodeHash(frame.hash) : undefined}
                // className={twMerge(``, className)}
                // onLoad={() => setLoaded(true)}
                {...getFancyAttributes(fancy, source)}
            />

        </div>
    )
    // return (
    //     <div style={{ position: "relative" }} className={containerClassName}>
    //         <div className={`absolute z-[1] ${loaded ? "hidden" : ''}`}>
    //             <OptionalChildren condition={!hashUrl || !data} fallback={<Fallback className={className} />}>
    //         <Image
    //             height={correctHeight}
    //             width={correctWidth}
    //             src={hashUrl}
    //             alt={alt || ""}
    //             className={twMerge("object-cover", className)}

    //         />
    //             </OptionalChildren>
    //         </div>

    //         <Image
    //             height={height || size}
    //             width={width || size}
    //             src={data}
    //             loading={prioritize ? "eager" : "lazy"}
    //             alt={alt || ""}
    //             // onError={() => setError(true)}
    //             className={twMerge(`${loaded ? '' : "opacity-0"} cursor-pointer`, className)}
    //             // className={twMerge(``, className)}
    //             // onLoad={() => setLoaded(true)}
    //             {...getFancyAttributes(fancy, source)}
    //         />

    //     </div>
    // )

}

export default ParloImage;