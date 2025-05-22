import { NotFoundFaceIcon } from "@assets/Icons"

export default function NotFound({ title, paras, ActionButton }: { title: string, paras: string[], ActionButton?: React.ReactNode }) {
    return (
        <section className="stretchContainer flex-col gap-3">
            <div className="inline-flex mx-auto flex-cntr-all gap-4">
                <span className="text-9xl font-extralight select-none">4</span>
                <NotFoundFaceIcon className="size-32" />
                <span className="text-9xl font-extralight select-none">4</span>
            </div>
            <h3 className="text-xl text-center">{title}</h3>
            {
                paras.map((para: string, ind: number) => (
                    <p key={ind} className="text-zinc-500 sapce-y-2 text-sm text-center">{para}</p>
                ))
            }
            {ActionButton}
        </section>
    )
}