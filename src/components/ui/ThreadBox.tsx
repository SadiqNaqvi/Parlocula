import Navigate from "@components/Navigate";
import { makeUrlSafe } from "@lib/utils";
import { MereThread } from "@type/internal";
import ParloImage from "./ParloImage";

const ThreadBox = ({ _id, name, poster }: MereThread) => (
    <article className="size-24" key={_id}>
        <Navigate className="size-full p-2 flex flex-col flex-cntr-all gap-3" comp="link" role="button" goto={`/thread/${_id}-${makeUrlSafe(name)}`}>
            <ParloImage
                frameType="profile"
                size={48}
              //  extSize="w45"
                className="size-12 object-cover rounded-full"
                frame={poster}
                alt={`Poster of thread ${name}`}
            />
            <h4 className="line-clamp-1 text-lg">{name}</h4>
        </Navigate>
    </article>
)

export default ThreadBox;