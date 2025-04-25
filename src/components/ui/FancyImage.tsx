import Image from "next/image";

const FancyImage = ({ src, id, download, caption, alt, height, width, ...args }: { src: string, id: string, alt: string, height: number, width: number, download?: string, caption?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
        <a href={src} data-fancybox={id} data-download-src={download ? src : undefined} data-download-filename={download} data-caption={caption}>
            <Image {...args} src={src} alt={alt} height={height} width={width} />
        </a>
    )
}

export default FancyImage;