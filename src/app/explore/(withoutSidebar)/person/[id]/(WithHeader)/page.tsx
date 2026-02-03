import { CinementGrid } from "@app/explore/(withoutSidebar)/components";
import { fetchPerson } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchPerson(company_id);
}

const ArtistAsCastPage = async ({ params }: ParloPageProps) => {

    const content = await fetchData(await params);

    if (!content) return null;

    return (
        <CinementGrid content_id={content.tmdb_id} section="cast" data={content.credits.cast} />
    )
}

export default ArtistAsCastPage;