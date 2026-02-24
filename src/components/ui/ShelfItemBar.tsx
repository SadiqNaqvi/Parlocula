import Navigate from "@components/Navigate";
import { ShelfItemType } from "@type/internal";
import ParloImage from "./ParloImage";

type ContentOnlyProps = Pick<ShelfItemType, "poster" | "title" | "year">;

const ShelfItemContent = ({ poster, title, year }: ContentOnlyProps) => (
    <article className="flex items-center gap-3 w-full">
        <ParloImage
            size={64}
            frame={poster}
            frameType="poster"
            alt={`Poster for ${title}`}
            //  extSize="w92"
            sizes={[
                { imageWidth: 48, maxScreenWidth: 480 },
                { imageWidth: 64 },
            ]}
            className="size-12 sm:size-16 object-cover rounded-full"
        />
        <div className="space-y-2">
            <h3 className="font-semibold sm:text-xl">{title}</h3>
            <span className="text-sm text-zinc-500">{year}</span>
        </div>
    </article>
)

export const ShowOnlyShelfItem = ShelfItemContent;

const ShelfItemBar = ({ taleon_type, poster, title, ext_id, year }: ShelfItemType) => (
    <Navigate className="w-full" goto={`/explore/${taleon_type}/${ext_id}`} comp="link">
        <ShelfItemContent poster={poster} title={title} year={year} />
    </Navigate>
)

export default ShelfItemBar;