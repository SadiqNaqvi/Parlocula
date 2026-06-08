import { BookmarkIcon, CommentIcon, FrameIcon, LinkIcon, RightChevron, ThumbUpIcon } from "@assets/Icons"

const MockupPostBar = ({ username }: { username?: string }) => {

    return (
        <article className="group p-2 w-full space-y-3 border-b border-gray40">

            <header className="flex gap-3 items-center">
                <span className="size-10 bg-gray60 rounded-full"></span>
                <div className="space-x-2">
                    <span className="font-semibold">Thread</span>
                    <RightChevron className="size-4 my-auto" />
                </div>
                <div className="space-x-2">
                    <span className="font-semibold">{username || "User"}</span>
                    <RightChevron className="size-4 my-auto" />
                </div>
            </header>

            <div className="group-odd:flex flex-col gap-2 md:flex-row-reverse">
                <section className="space-y-4 my-2 flex-1">
                    <ul className="flex gap-2 text-sm ghostColor">
                        {Array(3).fill(0).map((_, i) => (
                            <li key={i} className="h-2 w-10 rounded-md bg-gray60"></li>
                        ))}
                    </ul>

                    <div className="my-3 space-y-2">
                        {Array(3).fill(0).map((_, i) => (
                            <div style={{ width: `${100 / (i + 1)}%` }} key={i} className="h-4 rounded-md bg-gray60"></div>
                        ))}
                    </div>

                </section>
                <section className="group-even:hidden w-full xs:w-80 aspect-square rounded-md bg-gray60"></section>
            </div>

            <section className="flex gap-6">
                <div className="flex gap-2 text-sm ghostColor">

                    <div className="flex gap-1 items-center">
                        <ThumbUpIcon className="size-4" />
                        <span>X</span>
                    </div>

                    <div className="flex gap-1 items-center">
                        <CommentIcon className="size-4" />
                        <span>X</span>
                    </div>

                    <div className="flex gap-1 items-center">
                        <BookmarkIcon className="size-4" />
                        <span>X</span>
                    </div>
                </div>

                <div className="flex gap-2 text-sm ghostColor">
                    <div className="flex gap-1 items-center">
                        <FrameIcon />
                        <span>X</span>
                    </div>
                    <div className="flex gap-1 items-center">
                        <LinkIcon className="size-4" />
                        <span>X</span>
                    </div>
                </div>

            </section>

        </article>
    )
}

export default MockupPostBar;