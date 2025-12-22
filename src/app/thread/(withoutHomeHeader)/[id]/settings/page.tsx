import { RightChevron } from "@assets/Icons"
import { Navbar, Navigate } from "@components"
import { PropsWithChildren } from "react"

const ListContainer = ({ children, href }: PropsWithChildren<{ href?: string }>) => (
    <li className="px-2 *:py-3">
        {href ?
            <Navigate comp="link" goto={href} className="size-full flex flex-cntr-between">
                {children}
                <RightChevron className="size-4" />
            </Navigate>
            :
            <div>{children}</div>
        }
    </li>
)

const Sections = ({ heading, children }: PropsWithChildren<{ heading: string }>) => (
    <section className="rounded-md">
        <h2 className="uppercase text-sm text-semibold p-2">{heading}</h2>
        <ul className="bg-primarylight">{children}</ul>
    </section>
)

const ThreadSettingPage = () => {

    return (
        <>
            <Navbar className="mb-4" navTitle="Thread Settings" />
            <Sections heading="Appearance">
                <ListContainer href="edit">Edit Thread</ListContainer>
            </Sections>
            <Sections heading="People">
                <ListContainer href="managers">Managers</ListContainer>
                <ListContainer href="banned">Banned</ListContainer>
            </Sections>
            <Sections heading="Activity">
                <ListContainer href="report">Reports on Thread</ListContainer>
                <ListContainer href="report/posts">Reported Posts</ListContainer>
                <ListContainer href="report/comments">Reported Comments</ListContainer>
            </Sections>
        </>

    )
}

export default ThreadSettingPage;