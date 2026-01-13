import Carousel from "@components/FancyCarousel";
import FancyImage from "@components/FancyImage";
import { Frame } from "@type/internal";

const FramesCarousel = ({ frames, className = "", gallery }: { frames: Frame[], className?: string, gallery?: string }) => {

    if (!frames || !frames.length) return null;

    return (
        <Carousel className={`size-full flex overflow-hidden ${className}`}>
            {frames.map(({ path, type }) => (
                <div className="f-carousel__slide" key={path}>
                    <FancyImage containerClass="size-full md:rounded-md" src={path} type={type} alt="" height={500} width={500} id={gallery || "gallery"} key={path} className="size-full rounded-md object-cover" />
                </div>
            ))}
        </Carousel>
    )
}

export default FramesCarousel;