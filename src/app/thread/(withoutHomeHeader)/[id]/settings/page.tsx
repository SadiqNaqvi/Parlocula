import { BlockOrBanIcon, EditIcon, RightChevron, ShieldIcon, GroupIcon, AlertIcon, PostIcon, CommentIcon } from "@assets/Icons"
import { Navbar, Navigate } from "@components"
import { OptionalChildren } from "@components/ui"
import { ParloPageProps } from "@type/other"
import { PropsWithChildren } from "react"

const ListContainer = ({ children, href }: PropsWithChildren<{ href?: string }>) => (
    <li className="px-2 *:py-3">
        <OptionalChildren condition={href} fallback={children}>
            <Navigate comp="link" goto={href || ""} className="size-full flex flex-cntr-between">
                <div className="flex gap-2 items-center">
                    {children}
                </div>
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
                <ListContainer href={`/thread/${id}/settings/edit`}>
                    <EditIcon />
                    <span>Edit Thread</span>
                </ListContainer>
            </Sections>
            <Sections heading="People">
                <ListContainer href={`/thread/${id}/members`}>
                    <GroupIcon />
                    <span>Members</span>
                </ListContainer>
                <ListContainer href={`/thread/${id}/settings/managers`}>
                    <ShieldIcon />
                    <span>Managers</span>
                </ListContainer>
                <ListContainer href={`/thread/${id}/settings/banned`}>
                    <BlockOrBanIcon />
                    <span>Banned</span>
                </ListContainer>
            </Sections>
            <Sections heading="Activity">
                <ListContainer href={`/thread/${id}/settings/reports`}>
                    <AlertIcon />
                    <span>Reports on Thread</span>
                </ListContainer>
                <ListContainer href={`/thread/${id}/settings/reports/posts`}>
                    <PostIcon />
                    <span>Reported Posts</span>
                </ListContainer>
                <ListContainer href={`/thread/${id}/settings/reports/comments`}>
                    <CommentIcon />
                    <span>Reported Comments</span>
                </ListContainer>
            </Sections>
        </>

    )
}

export default ThreadSettingPage;