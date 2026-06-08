import { NotFoundFaceIcon } from "@assets/Icons"
import Navbar from "@components/Navbar"
import Navigate from "@components/Navigate"
import { OptionalChildren } from "@components/ui"

type ActionButtonProps = {
    ActionButton?: React.ReactNode
    redirectTo?: string,
    redirectToExplore?: boolean

}

type Props = {
    title: string,
    paras: string[],
    fullScreen?: boolean,
} & ActionButtonProps;

const PrimaryButton = ({ ActionButton, redirectTo, redirectToExplore }: ActionButtonProps) => {
    if (ActionButton) return ActionButton

    else if (redirectTo || redirectToExplore) return (
        <Navigate
            comp="link"
            goto={redirectTo || "/explore/search"}
            className="primary btn"
            type="button"
        >
            Lets Go
        </Navigate>
    )
}


const NotFound = ({ title, paras, ActionButton, fullScreen, redirectTo, redirectToExplore }: Props) => {
    return (
        <>
            <OptionalChildren condition={fullScreen}>
                <Navbar />
            </OptionalChildren>
            <section className="h-size-screen w-full flex flex-col flex-cntr-all gap-3">

                <div className="inline-flex mx-auto flex-cntr-all gap-4">
                    <span className="text-8xl sm:text-9xl font-extralight select-none">4</span>
                    <NotFoundFaceIcon className="size-24 sm:size-32" />
                    <span className="text-8xl sm:text-9xl font-extralight select-none">4</span>
                </div>

                <h3 className="text-xl text-center">{title}</h3>

                <div>
                    {
                        paras.map((para: string, ind: number) => (
                            <p key={ind} className="ghostColor sapce-y-2 text-sm text-center">{para}</p>
                        ))
                    }
                </div>

                <PrimaryButton ActionButton={ActionButton} redirectTo={redirectTo} redirectToExplore={redirectToExplore} />

            </section>
        </>
    )
}

export default NotFound;