import CinementThreadPage from "@app/explore/(withoutSidebar)/components/CinementThreadPage";
import { fetchShow } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const id = (await params).id.split('-')[0];

    const data = await fetchShow(id, false);
    if (!data) return { title: "Parlocula" };
    return {
        title: `Threads on ${data.title} - Parlocula`,
        description: data.overview,
    }
}

const Page = CinementThreadPage;

export default Page;