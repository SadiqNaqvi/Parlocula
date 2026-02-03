import { CinementGrid } from "@app/explore/(withoutSidebar)/components";
import { ParloPageProps } from "@type/other";

const ShowsPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <CinementGrid content_id={id} section="shows_company" />
    )
}

export default ShowsPage;