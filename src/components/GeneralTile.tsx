import Image from "next/image";

const GeneralTile = ({ title, className = "", poster, onClick }: { title: string, poster?: string, className?: string, onClick?: (...arg: any) => any }) => {
    return (
        <div className={className + " pointer items-center flex gap-3"} onClick={onClick}>
            {poster && <Image className="size-12 object-cover rounded-md " width={50} height={50} alt={`Poster of ${title}`} src={poster} />}
            <h3>{title}</h3>
        </div>
    )
}

export default GeneralTile;