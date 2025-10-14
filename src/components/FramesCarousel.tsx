import Carousel from "@components/FancyCarousel";
import FancyImage from "@components/FancyImage";
import { Frame } from "@type/internal";

const FramesCarousel = ({ frames, className = "" }: { frames: Frame[], className?: string }) => {
    return (
        <Carousel className={`max-w-[400px] aspect-square flex overflow-hidden mx-auto border border-gray20 rounded-md ${className}`}>
            {frames.map(({ path, type }) => (
                <div className="f-carousel__slide" key={path}>
                    <FancyImage containerClass="size-full" src={path} type={type} alt="" height={500} width={500} id="gallery" key={path} className="size-full rounded-md object-cover" />
                </div>
            ))}
        </Carousel>
    )
}

export default FramesCarousel;