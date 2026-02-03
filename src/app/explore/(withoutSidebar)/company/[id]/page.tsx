import { ParloPageProps } from "@type/other";
import { CinementGrid } from "../../components";

const MoviesPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    return (
        <CinementGrid content_id={id} section="movies_company" />
    )
}

export default MoviesPage;