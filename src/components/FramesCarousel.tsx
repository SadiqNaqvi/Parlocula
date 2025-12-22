import Carousel from "@components/FancyCarousel";
import FancyImage from "@components/FancyImage";
import { Frame } from "@type/internal";

const FramesCarousel = ({ frames, className = "" }: { frames: Frame[], className?: string }) => {

    if (!frames || !frames.length) return null;
    
    return (
        <Carousel className={`size-full flex overflow-hidden ${className}`}>
            {frames.map(({ path, type }) => (
                <div className="f-carousel__slide" key={path}>
                    <FancyImage containerClass="size-full" src={path} type={type} alt="" height={500} width={500} id="gallery" key={path} className="size-full rounded-md object-cover" />
                </div>
            ))}
        </Carousel>
    )
}

export default FramesCarousel;