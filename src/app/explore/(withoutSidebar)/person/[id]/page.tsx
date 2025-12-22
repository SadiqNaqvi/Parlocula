import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { NotFound } from "@components/ui";
import { fetchPerson } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { Metadata } from "next";
import { MediaFetcher, ThreadFetcher } from "../../components";
import { Navigate } from "@components";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchPerson(company_id);
}

type Props = { params: { id: string } };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const data = await fetchData(params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.name} - Parlocula`,
        description: data.biography,
    };
};

const Page = async ({ params }: Props) => {

    const content = await fetchData(params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like The Parlocula Explorers couldn't find anything"
            paras={[
                `Possible reasons: person id is incorrect`,
                `Please search the person in the Explore Page`
            ]}
        />
    )

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out ${content.name} on Parlocula`}
                navTitle={content.name}>

                <div className="flex gap-4">
                    <FancyImage
                        id="profile"
                        thumbnail={getPoster({ external: true, type: "profile", path: content.profile, size: "w185" })}
                        src={getPoster({ external: true, type: "profile", path: content.profile, size: "original" })}
                        height={160}
                        width={160}
                        download={`Profile Picture of ${content.name} - Parlocula`}
                        className="border-4 border-primary object-cover size-24 sm:size-40 rounded-full"
                        alt={`Profile Picture of ${content.name}`}
                    />
                </div>

                <h1 data-observe className="text-xl sm:text-4xl mt-4 font-semibold uppercase">{content.name}</h1>
                <p className="text-sm md:text-base text-zinc-500">Profession: {content.department}</p>

                <p className="text-sm text-gray-500 mt-6 line-clamp-6">{content.biography}</p>
                <div className="mt-4">
                    <p className="my-2 text-zinc-500 text-xs md:text-sm">Born on: {new Date(content.birth).toDateString()} at {content.place_of_birth}</p>
                    {content.death &&
                        <p className="my-2 text-zinc-500 text-xs md:text-sm">Died on: {new Date(content.death).toDateString()} at {content.place_of_death}</p>
                    }
                </div>
            </ObserverHeader>
            <section className="space-y-2 py-4 my-2">
                <div className="flex-flex-cntr-between">
                    <h3 className="uppercase text-sm font-semibold">Connected Threads</h3>
                    <Navigate comp="link" goto={`${content.tmdb_id}/threads`}>More</Navigate>
                </div>
                <ThreadFetcher id={content.tmdb_id} type="person" />
            </section>
            <MediaFetcher id={content.tmdb_id.toString()}
                sections={[
                    { label: "Work as Cast", section: "cast", data: content.credits.cast },
                    { label: "Work as Crew", section: "crew", data: content.credits.crew }
                ]} />
        </>
    )
}

export default Page;