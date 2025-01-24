import { NotFoundFaceIcon } from "@assets/Icons"

export default function NotFound({ title, paragraph }: { title: string, paragraph: string[] }) {
    return (
        <section className="flex flex-cntr-all size-full">
            <div>
                <NotFoundFaceIcon classnames="size-40 mx-auto" />
                <h3 className="text-2xl my-4 text-center line-clamp-4">{title}</h3>
                {
                    paragraph.map((para: string, ind: number) => (
                        <p key={ind} className="text-zinc-500 my-2 text-center">{para}</p>
                    ))
                }
            </div>
        </section>
    )
}