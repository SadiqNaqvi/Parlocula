import { NotFoundFaceIcon } from "@assets/Icons"

export default function NotFound({ title, paras, ActionButton }: { title: string, paras: string[], ActionButton?: React.ReactNode }) {
    return (
        <section className="mt-[25dvh] flex flex-cntr-all size-full">
            <div>
                <NotFoundFaceIcon classnames="size-40 mx-auto" />
                <h3 className="text-2xl my-4 text-center">{title}</h3>
                {
                    paras.map((para: string, ind: number) => (
                        <p key={ind} className="text-zinc-500 my-2 text-sm text-center">{para}</p>
                    ))
                }
                {Boolean(ActionButton) && ActionButton}
            </div>
        </section>
    )
}