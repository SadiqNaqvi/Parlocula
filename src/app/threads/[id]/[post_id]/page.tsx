import Navbar from "@app/explore/exploreComponents/Navbar";
import { BookmarkIcon, ThumbDownIcon, ThumbUpIcon } from "@assets/Icons";
import placeholder from "@assets/placeholder.png"
import { CommentTile } from "@components";
import Image from "next/image";

export default function Page() {
    return (
        <>
            <Navbar classnames="sticky bg-primary -mt-4 mb-4" />
            <header className="flex gap-2">
                <Image
                    className="size-8 rounded-full"
                    src={placeholder} width={20} height={20} alt="" />
                <p className="my-auto">username ~ thread name</p>
            </header>
            <section className="mt-4 space-y-4">
                <h1 className="text-xl font-semibold">Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque dolorem nostrum aperiam amet repellendus, ut beatae voluptatem doloremque laborum nisi fugit sequi quas minima recusandae ipsa quod itaque laboriosam? Error quidem illo, nam ipsum est accusantium id quis voluptatum magni iure, modi quam nobis perferendis nostrum quibusdam minima delectus omnis.</h1>
                <p className="whitespace-break-spaces">{`Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi provident non accusamus recusandae fugit explicabo excepturi? Harum dolore, quos doloremque maxime cumque similique est, molestias optio reprehenderit non soluta quas sapiente consequatur labore eius eligendi beatae numquam earum corrupti animi quia fugit veniam libero! Doloremque, numquam est veritatis officia vero quia assumenda. \n\nDucimus numquam, minima perspiciatis quis pariatur illum accusantium natus, dolores ex deserunt officiis vero eum quam at autem tempora architecto, eligendi aliquid obcaecati? Odit deserunt, iusto ex, nemo illum veritatis enim, quia nam quis officia ad repellat alias! Quas, odit dolores libero inventore numquam praesentium explicabo officia modi quisquam nihil ducimus voluptatibus deserunt dolorum porro adipisci tempore vitae dignissimos consequuntur consectetur. \n\nRepudiandae ipsam ut distinctio a, vero cupiditate dignissimos sit ducimus explicabo! Ex eaque saepe voluptates tempora odio deleniti.\n\nNulla ad tempore at dolorem perspiciatis, alias fugit non reprehenderit repellendus, fuga quod mollitia voluptatem aut officiis autem. Voluptas, pariatur? Non voluptatem corporis quos asperiores laborum quia similique, explicabo temporibus nemo obcaecati. \n\nAccusantium qui enim assumenda perspiciatis aliquid odit voluptates aut incidunt dolorem laborum illo aperiam laudantium nisi sequi quasi in inventore, temporibus reiciendis libero ex neque. Eos accusantium dolores dolor rerum sint similique omnis. \n\nDistinctio impedit reiciendis fuga expedita corporis numquam cum itaque cupiditate voluptatum debitis voluptas ab quos minus eius inventore, modi doloribus! Accusamus doloribus earum enim quas neque, obcaecati debitis dolore sed in excepturi modi officia consectetur optio?`}</p>
            </section>
            <section className="mt-4 flex flex-cntr-between">
                <div className="flex p-2 border border-gray-500 border-opacity-30 rounded-md">
                    <button className="border-0 smallBtn">
                        <ThumbUpIcon />
                    </button>
                    <span className="px-2 mx-2 border-x border-gray-500 border-opacity-30">4.6k</span>
                    <button className="border-0 smallBtn">
                        <ThumbDownIcon />
                    </button>
                </div>
                <button className="border-0 smallBtn">
                    <BookmarkIcon />
                </button>
            </section>
            <p className="my-4 text-zinc-500 text-center">Comments are sorted based on the upvotes. If you want a comment to appear on top, make sure to upvote it.</p>
            <section>
                {new Array(10).fill(0).map((_, ind) => (
                    <CommentTile key={ind} replies />
                ))}
            </section>
        </>
    )
}