import { FancyCarousel, FancyImage } from "@components";
import { Frame } from "@type/internal";
import { twMerge } from "tailwind-merge";

const FramesCarousel = ({ frames, className = "", gallery }: { frames: Frame[], className?: string, gallery?: string }) => {

    if (!frames || !frames.length) return null;

    return (
        <FancyCarousel className={twMerge("size-full flex overflow-hidden md:rounded-md", className)}>
            {frames.map(({ path, type }) => (
                <div className="f-carousel__slide" key={path}>
                    <FancyImage containerClass="size-full" src={path} type={type} alt="" height={500} width={500} id={gallery || "gallery"} key={path} className="size-full rounded-md object-cover" />
                </div>
            ))}
        </FancyCarousel>
    )
}

export default FramesCarousel;