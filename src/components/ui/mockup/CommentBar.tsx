import { BookmarkIcon, RightChevron, ThumbUpIcon } from "@assets/Icons";

const MockupCommentBar = ({ username }: { username?: string }) => (
    <article className="group w-full my-2 p-2 border-b border-gray50">

        <header className="flex gap-2 items-center">
            <span className="size-8 bg-gray60 rounded-full"></span>

            <div className="space-x-2">
                <span className="font-semibold">Thread</span>
                <RightChevron className="size-4 my-auto" />
            </div>
            <div className="space-x-2">
                <span className="font-semibold">User</span>
                <RightChevron className="size-4 my-auto" />
            </div>
            <div className="space-x-2">
                <span className="font-semibold">Post</span>
                <RightChevron className="size-4 rotate-90 my-auto" />
            </div>
        </header>

        <ul className="mt-2 flex gap-2">
            {Array(4).fill(0).map((_, i) => (
                <li key={i}
                    className={`h-2 w-10 rounded-md ${i < 2 ? "bg-gray60" : i === 2 ? "bg-red-400 bg-opacity-20" : "bg-purple-400 bg-opacity-20"}`}></li>
            ))}
        </ul>

        <section className="my-2 space-y-4">
            <div className="group-even:hidden w-20 aspect-square rounded-md bg-gray60"></div>
            <div className="my-3 space-y-2">
                {Array(3).fill(0).map((_, i) => (
                    <div style={{ width: `${100 / (i + 1)}%` }} key={i} className="h-2 rounded-md bg-gray60"></div>
                ))}
            </div>
        </section>

        <section className="flex mt-2 gap-3">

            <span className="flex gap-1 text-gray-500">
                <ThumbUpIcon className="h-4" />
                <span>X</span>
            </span>

            <span className="flex gap-1 text-gray-500">
                <BookmarkIcon className="h-4" />
                <span>X</span>
            </span>
            <span>Reply</span>

        </section>
    </article>
)

export default MockupCommentBar;