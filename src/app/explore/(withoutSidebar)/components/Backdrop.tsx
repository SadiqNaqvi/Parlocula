import { ParloImage } from "@components/ui";
import { getPoster } from "@lib/utils";

const BackdropContainer = ({ path, title }: { path: string, title: string }) => (
    <ParloImage
        fancy={{
            gallery: "backdrop-popover",
            fullSizePath: getPoster({ external: true, type: "backdrop", path, size: "original" }),
            fileNameToDownload: `${title} - Parlocula`,
        }}
        containerClassName="w-full"
        width={768}
        height={300}
        className="w-full rounded-md aspect-[16/9] max-h-[300px] object-cover object-top"
        alt="Backdrop"
        frame={getPoster({ external: true, type: "backdrop", path, size: "w780" })}
    />
)

export default BackdropContainer;