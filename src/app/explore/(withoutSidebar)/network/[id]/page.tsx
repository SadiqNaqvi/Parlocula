import { TaleonGrid } from "@app/explore/(withoutSidebar)/components";
import { ParloPageProps } from "@type/other";

const Page = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <TaleonGrid content_id={id} section="movies_network" />
    )
}

export default Page;