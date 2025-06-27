import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { NotFound } from "@components/ui";
import { fetchCompany, fetchMoviesWithCompany } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { Metadata } from "next";
import MediaFetcher from "../../components/MediaFetcher";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchCompany(company_id);
}

type Props = { params: { id: string } };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const data = await fetchData(params);

    if (!data) return { title: "Popcorn Paragon" };
    return {
        title: `${data.name} - Popcorn Paragon`,
        description: data.description,
    };
};

const Page = async ({ params }: Props) => {

    const content = await fetchData(params);

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
                titleToShare={`Check out the movies and shows from ${content.name} on Popcorn Paragon`}
                navTitle={content.name}>

                <div className="flex gap-4">
                    <FancyImage
                        id="poster"
                        thumbnail={getPoster({ external: true, type: "logo", path: content.logo_path, size: "w92" })}
                        src={getPoster({ external: true, type: "logo", path: content.logo_path, size: "original" })}
                        height={160}
                        width={160}
                        download={`Poster of ${content.name} - Popcorn Paragon`}
                        className="border-4 border-primary object-contain bg-gray30 size-24 sm:size-40 rounded-full"
                        alt={`Poster of ${content.name}`}
                    />
                </div>

                <h1 data-observe className="text-xl sm:text-4xl mt-4 font-semibold uppercase">{content.name}</h1>
                <p className="text-sm md:text-base text-zinc-500">Situated at: {content.headquarters}</p>

                {content.description && <p className="text-sm text-gray-500 mt-6 line-clamp-4">{content.description}</p>}
            </ObserverHeader>
            <MediaFetcher id={content.id.toString()}
                sections={[
                    { label: "movies", section: "movies_company" },
                    { label: "shows", section: "shows_company" }
                ]} />
        </>
    )
}

export default Page;