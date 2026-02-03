import CinementThreadPage from "@app/explore/(withoutSidebar)/components/CinementThreadPage";
import { fetchPerson } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const id = (await params).id.split('-')[0];

    const data = await fetchPerson(id);
    if (!data) return { title: "Parlocula" };
    return {
        title: `Threads on ${data.name} - Parlocula`,
        description: data.biography,
    }
}

const Page = CinementThreadPage;

export default Page;