import { MediaFetcher } from "@app/explore/(withoutSidebar)/components";
import { ParloPageProps } from "@type/other";

const ShowsPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <MediaFetcher content_id={id} section="shows_company" />
    )
}

export default ShowsPage;