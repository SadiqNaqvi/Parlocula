import { ParloPageProps } from "@type/other";
import { TaleonGrid } from "../../components";

const MoviesPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <TaleonGrid content_id={id} section="movies_company" />
    )
}

export default MoviesPage;