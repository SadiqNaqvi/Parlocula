import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { NotFound } from "@components/ui";
import { fetchCompany } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { Metadata } from "next";
import MediaFetcher from "../../components/MediaFetcher";
import { ParloPageProps } from "@type/other";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchCompany(company_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchData(await params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.description,
    };
};

const Page = async ({ params }: ParloPageProps) => {

    const content = await fetchData(await params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like we could'nt find anything"
            paras={[
                "Possible Reason: The company id is incorrect.",
                "Please try to search the company in the explore page",
            ]} />
    );

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out the movies and shows by ${content.title} on Parlocula`}
                navTitle={content.title}>

                <div className="flex gap-4">
                    <FancyImage
                        id="poster"
                        thumbnail={getPoster({ external: true, type: "logo", path: content.poster, size: "w92" })}
                        src={getPoster({ external: true, type: "logo", path: content.poster, size: "original" })}
                        height={160}
                        width={160}
                        download={`Poster of ${content.title} - Parlocula`}
                        className="border-4 border-primary object-contain bg-gray30 size-24 sm:size-40 rounded-full"
                        alt={`Poster of ${content.title}`}
                    />
                </div>

                <h1 data-observe className="text-xl sm:text-4xl mt-4 font-semibold uppercase">{content.title}</h1>
                <p className="text-sm md:text-base text-zinc-500">Situated at: {content.headquarters}</p>

                {content.description && <p className="text-sm text-gray-500 mt-6 line-clamp-4">{content.description}</p>}
            </ObserverHeader>

            <MediaFetcher id={content.tmdb_id}
                sections={[
                    { label: "movies", section: "movies_company" },
                    { label: "shows", section: "shows_company" }
                ]} />
        </>
    )
}

export default Page;