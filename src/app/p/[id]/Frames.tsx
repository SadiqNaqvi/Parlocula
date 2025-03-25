import { getInternalPoster, getThumbnail } from "@lib/utils";
import { Frame } from "@type/internal";
import Image from "next/image";

const options = {
    height: 250, width: 250, aspectRatio: 1,
}

const Frames = ({ frames }: { frames: Frame[] }) => {
    return (
        <div className="flex gap-4 my-6">
            {frames.map(({ path, type }, ind) => (
                <span key={path} className="size-[250px] rounded-md border-gray-500 bg-gray-500 bg-opacity-30">
                    {type === "image" ?
                        <Image
                            className="size-full object-contain"
                            src={getInternalPoster({ path, options })}
                            height={250}
                            width={250}
                            alt={`${ind + 1} frame of the post`}
                        />
                        :
                        <video
                            className="size-full object-contain" preload="metadata" poster={getThumbnail(path)}>
                            <source src={path} />
                        </video>
                    }
                </span>
            ))}
        </div>
    )
}

export default Frames;