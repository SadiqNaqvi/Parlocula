import { fetchShow } from "@lib/contentFetcher"
import { RefinedShowData } from "@type/external"
import { Metadata } from "next"
import MediaPage from "../../components/MediaPage"

type Props = { params: { id: string } };

const fetchData = async (params: { id: string }) => {

    const show_id = params.id.split('-')[0];
    if (show_id === "undefined" || show_id.length < 4) return;

    return await fetchShow(show_id)
}

 

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const data = await fetchData(params);

    if (!data) return { title: "Popcorn Paragon" };
    return {
        title: `${data.title} - Popcorn Paragon`,
        description: data.overview,
    };
};

export default async function Page({ params }: Props) {

    const content: RefinedShowData | undefined = await fetchData(params);

    return <MediaPage content={content} type="show" />
}