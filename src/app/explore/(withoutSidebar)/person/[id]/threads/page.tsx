import MediaThreadsPage from "@app/explore/(withoutSidebar)/components/MediaThreadsPage";
import { fetchPerson } from "@lib/contentFetcher";
import { Metadata } from "next";

type Props = {
    params: { id: string },
    searchParams: { p?: string, f?: string },
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const id = params.id.split('-')[0];

    const data = await fetchPerson(id);
    if (!data) return { title: "Parlocula" };
    return {
        title: `Threads on ${data.name} - Parlocula`,
        description: data.biography,
    }
}

const Page = MediaThreadsPage;

export default Page;