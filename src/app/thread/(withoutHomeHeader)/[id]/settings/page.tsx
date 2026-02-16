import { RightChevron } from "@assets/Icons"
import { Navbar, Navigate } from "@components"
import { OptionalChildren } from "@components/ui"
import { ParloPageProps } from "@type/other"
import { PropsWithChildren } from "react"

const ListContainer = ({ children, href }: PropsWithChildren<{ href?: string }>) => (
    <li className="px-2 *:py-3">
        <OptionalChildren condition={href} fallback={children}>
            <Navigate comp="link" goto={href || ""} className="size-full flex flex-cntr-between">
                {children}
                <RightChevron className="size-4" />
            </Navigate>
        </OptionalChildren>
    </li>
)

const Sections = ({ heading, children }: PropsWithChildren<{ heading: string }>) => (
    <section className="px-2">
        <h2 className="parloHeading p-2">{heading}</h2>
        <ul className="border p-2 border-gray40 rounded-md">{children}</ul>
    </section>
)

const ThreadSettingPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <>
            <Navbar className="mb-4" navTitle="Thread Settings" />
            <Sections heading="Appearance">
                <ListContainer href={`/thread/${id}/settings/edit`}>Edit Thread</ListContainer>
            </Sections>
            <Sections heading="People">
                <ListContainer href={`/thread/${id}/settings/managers`}>Managers</ListContainer>
                <ListContainer href={`/thread/${id}/settings/banned`}>Banned</ListContainer>
            </Sections>
            <Sections heading="Activity">
                <ListContainer href={`/thread/${id}/settings/report`}>Reports on Thread</ListContainer>
                <ListContainer href={`/thread/${id}/settings/report/posts`}>Reported Posts</ListContainer>
                <ListContainer href={`/thread/${id}/settings/report/comments`}>Reported Comments</ListContainer>
            </Sections>
        </>

    )
}

export default ThreadSettingPage;