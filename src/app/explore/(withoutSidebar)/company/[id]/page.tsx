import { ParloPageProps } from "@type/other";
import { MediaFetcher } from "../../components";

const MoviesPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <MediaFetcher content_id={id} section="movies_company" />
    )
}

export default MoviesPage;