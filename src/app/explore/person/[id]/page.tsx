import { refinePersonData } from "@lib/dataRefiner"
import { VerticleMovieCard } from "@components";
import { FullPersonDetails, RefinedPersonData } from "@lib/types";
import LayoutContainer from "@app/explore/exploreComponents/LayoutContainer";

const fetchData = async (id: string): Promise<RefinedPersonData> => {
    try {
        console.count("aaya")
        const data: { status: boolean; response: FullPersonDetails } = await (
            await fetch(`https://testlalaapp.vercel.app/api/person?id=${id}`)
        ).json();
        if (data.status) return refinePersonData(data.response);
        throw new Error(
            "Some erorr occoured while fetching person in try: " + data.response
        );
    } catch (err: any) {
        // console.error("Error occured while fetching person in catch:" + err.message);
        throw new Error("Error occured while fetching person in catch" + err.message)
    }
}

export default async function Page({ params: { id } }: { params: { id: string } }) {

    const content = await fetchData(id);
    // const content = refinePersonData(examplePersonDetails);
    return (
        <>
            <LayoutContainer backdrop="" poster={content.profile} poster_type="profile" poster_classname="object-cover object-top">
                <h1 className="-mt-10 md:-mt-20 text-2xl md:text-4xl uppercase font-semibold">{content.name}</h1>
                <div className="mt-1 text-sm w-fit py-1 md:py-2 px-2 md:px-4 rounded-xl bg-gray20">Profession: {content.department}</div>
                <p className="my-2 text-zinc-500 text-xs md:text-sm">Born on: {new Date(content.birth).toDateString()} at {content.place_of_birth}</p>
                {content.death &&
                    <p className="my-2 text-zinc-500 text-xs md:text-sm">Died on: {new Date(content.death).toDateString()} at {content.place_of_death}</p>
                }
                <details className="mt-3 bioDetail">
                    <summary className="cursor-pointer line-clamp-3 relative text-sm md:text-base">{content.biography}</summary>
                </details>
                <div className="mt-4">
                    <button className="primary">Add to Favourite</button>
                </div>
            </LayoutContainer>
            <main className="-mt-4 md:mt-0 max-w-screen-lg mx-auto *:px-2 *:md:px-4">
                <section className="mt-6">
                    <div className="flex mt-2">
                        <span className="py-2 cursor-pointer px-4 border-b-2 border-orange-500">As Cast</span>
                        <span className="py-2 cursor-pointer px-4">As Crew</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                        {content.credits.cast.map(el => (
                            <VerticleMovieCard link={`/explore/${el.media_type}/${el.tmdb_id}`} poster={el.poster} title={el.title} key={el.tmdb_id} year={new Date(el.release_date).getFullYear().toString()} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    )
}