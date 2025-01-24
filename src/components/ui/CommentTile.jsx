import Image from "next/image";
import placeholder from "@assets/placeholder.png"
import { Ellipsis, ThumbDownIcon, ThumbUpIcon } from "@assets/Icons";
export default function CommentTile({ replies = false }) {
    return (
        <>
            <details className="w-full p-2 my-2 bg-primarylight" open>
                <summary className="flex flex-cntr-between">
                    <div className="flex gap-2">
                        <Image src={placeholder}
                            className="size-8 rounded-full"
                            height={32}
                            width={32}
                            alt="" />
                        <ul className="flex gap-2 flex-cntr-all text-sm">
                            <li className="font-semibold">username</li>
                            <li className="text-zinc-500">~ 1 day ago</li>
                        </ul>
                    </div>
                    <button className="iconBtn">
                        <Ellipsis classnames="h-4" />
                    </button>
                </summary>
                <div className="my-2 grid grid-cols-[2rem,1fr]">
                    <div>
                        <div className="w-0 h-full mx-auto border-r-2 border-zinc-500"></div>
                    </div>
                    <div>
                        <p className="text-sm">
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Non iure doloribus, fugit exercitationem consequatur commodi deserunt asperiores at praesentium. Maxime ipsum est reiciendis, facere architecto ut possimus perspiciatis fuga facilis fugiat quam voluptate obcaecati distinctio unde aliquam cum commodi inventore illo, magni, eaque laborum pariatur! Cupiditate ullam repellat recusandae facilis?
                        </p>
                        <section className="flex mt-2 gap-2">
                            <div className="flex flex-cntr-all py-1 px-2 border border-zinc-500 border-opacity-30 rounded-md">
                                <button className="smallBtn border-0">
                                    <ThumbUpIcon classnames="h-4" />
                                </button>
                                <span className="px-2 mx-2 text-sm border-x border-zinc-500 border-opacity-30">
                                    30
                                </span>
                                <button className="smallBtn border-0">
                                    <ThumbDownIcon classnames="h-4" />
                                </button>
                            </div>
                            <button className="smallBtn my-auto border-0">Reply</button>
                        </section>
                        {replies && <CommentTile />}
                    </div>
                </div>
            </details>
        </>
    )
}