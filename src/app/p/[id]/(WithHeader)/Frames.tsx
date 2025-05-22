import Carousel from "@components/FancyCarousel";
import FancyImage from "@components/FancyImage";
import { Frame } from "@type/internal";

const Frames = ({ frames }: { frames: Frame[] }) => {
    return (
        <Carousel className="max-w-full w-[400px] aspect-square mx-auto">
            {frames.map(({ path, type }) => (
                <div className="f-carousel__slide" key={path}>
                    <FancyImage src={path} type={type} alt="" height={500} width={500} id="gallery" key={path} className="size-full rounded-md object-cover" />
                </div>
            ))}
        </Carousel>
    )
}

export default Frames;