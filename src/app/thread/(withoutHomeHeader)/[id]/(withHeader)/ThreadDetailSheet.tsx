import { RightChevron } from "@assets/Icons";
import { Navigate } from "@components";
import { LinkTile } from "@components/ui";
import { timeAgo } from "@lib/utils";
import { Thread } from "@type/internal";

type Props = Pick<Thread, "connections" | "createdAt" | "description" | "creator" | "edited_by" | "links" | "managers">

const ThreadDetailSheet = ({ connections, createdAt, creator, description, edited_by, links, managers }: Props) => {

    return (
        <>
            <div className="py-2 border-b border-gray30">
                <h2 className="parloHeading text-center">More about this thread</h2>
            </div>

            <section className="my-3 space-y-2">
                <h3 className="text-sm">Description</h3>
                <p>{description}</p>
                <p className="text-sm text-zinc-500">Created At: {timeAgo(createdAt)}</p>
            </section>

            {creator && (
                <section className="my-3 space-y-2">
                    <h3 className="text-sm">Creator</h3>
                    <div className="border border-gray20 rounded-md">
                        <Navigate comp="link" goto={`/user/${creator}`} className="p-2 flex flex-cntr-all gap-2">
                            <span className="line-clamp-1">{creator}</span>
                            <span><RightChevron /></span>
                        </Navigate>
                    </div>
                </section>
            )}

            <section className="my-3 space-y-2">
                <h3 className="text-sm">Managers</h3>
                {Boolean(managers.length) ? (
                    <ul className="space-y-2">
                        {managers.map(({ _id, username }) => (
                            <li key={_id} className="border border-gray20 rounded-md">
                                <Navigate className="p-2 flex gap-2 flex-cntr-between" comp="link" goto={`/user/${username}`}>
                                    <span className="line-clamp-1">{username}</span>
                                    <span><RightChevron /></span>
                                </Navigate>
                            </li>
                        ))}
                    </ul>
                )
                    : (
                        <div className="py-4">
                            <p>No Managers Yet</p>
                        </div>
                    )}
            </section>


            {edited_by && (
                <section className="my-3 space-y-2">
                    <h3 className="text-sm">Last Edited By</h3>
                    <div className="border border-gray20 rounded-md">
                        <Navigate comp="link" goto={`/user/${edited_by}`} className="p-2 flex flex-cntr-all gap-2">
                            <span className="line-clamp-1">{edited_by}</span>
                            <span><RightChevron /></span>
                        </Navigate>
                    </div>
                </section>
            )}

            <section className="my-3 space-y-2">
                <h3 className="text-sm">Connections</h3>
                <ul className="space-y-2">
                    {connections.map(({ name, path, type }) => (
                        <li key={path} className="border border-gray20 rounded-md">
                            <Navigate className="p-2 flex gap-2 flex-cntr-between" comp="link" goto={`/${type}/${path}`}>
                                <span className="line-clamp-1">{name}</span>
                                <span><RightChevron /></span>
                            </Navigate>
                        </li>
                    ))}
                </ul>
            </section>

            {Boolean(links.length) && (
                <section className="my-3 space-y-2">
                    <h3 className="text-sm">External Links</h3>
                    <ul className="space-y-2">
                        {links.map(link => (
                            <LinkTile key={link.path} {...link} />
                        ))}
                    </ul>
                </section>
            )}

        </>
    )

}

export default ThreadDetailSheet;