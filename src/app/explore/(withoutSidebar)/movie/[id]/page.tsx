import { fetchMovie } from "@lib/contentFetcher";
import MediaPage from "../../components/MediaPage";
import { Metadata } from "next";

type Props = { params: { id: string } };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { id } = params;
    const data = await fetchMovie(id);

    if (!data) return { title: "Popcorn Paragon" };
    return { title: `${data.title} - Popcorn Paragon` };
};

 

export default async function MoviePage({ params }: Props) {

    const { id } = params;
    const content = await fetchMovie(id);
    return <MediaPage content={content} type="movie" />
};