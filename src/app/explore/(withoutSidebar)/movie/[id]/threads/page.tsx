import MediaThreadsPage from "@app/explore/(withoutSidebar)/components/MediaThreadsPage";
import { fetchMovie } from "@lib/contentFetcher";
import { Metadata } from "next";

type Props = {
    params: { id: string },
    searchParams: { p?: string, f?: string },
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const id = params.id.split('-')[0];

    const data = await fetchMovie(id);
    if (!data) return { title: "Popcorn Paragon" };
    return {
        title: `Threads on ${data.title} - Popcorn Paragon`,
        description: data.overview,
    }
}

const Page = MediaThreadsPage;

export default Page;