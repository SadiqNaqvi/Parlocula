import Navigate from "@components/Navigate";
import { getInternalPoster, refineString } from "@lib/utils";
import { MereThread } from "@type/internal";
import Image from "next/image";

const ThreadBox = ({ _id, name, poster }: MereThread) => (
    <article className="size-24" key={_id}>
        <Navigate className="size-full p-2 flex flex-col flex-cntr-all gap-3" comp="link" role="button" goto={`/t/${_id}-${refineString(name)}`}>
            <Image
                height={48}
                width={48}
                className="size-12 object-cover rounded-full"
                src={getInternalPoster({ path: poster })}
                alt={`Poster of thread ${name}`}
            />
            <h4 className="line-clamp-1 text-lg">{name}</h4>
        </Navigate>
    </article>
)

export const ThreadBoxLoadingSkeleton = () => (
    <div className="size-24 p-2 space-y-3">
        <div className="size-12 animate-pulse rounded-full"></div>
        <div className="h-[18px] w-3/4 animate-pulse rounded-lg"></div>
    </div>
)

export default ThreadBox;