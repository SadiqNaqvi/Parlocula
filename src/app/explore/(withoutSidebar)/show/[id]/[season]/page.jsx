import Container from "@app/explore/exploreComponent/container";
import { ContentBox } from "@components";
import { getPoster, refineSeasonData, refineString } from "@lib/dataRefiner"
import { exampleSeasonDetails } from "@lib/sampleData"
import Image from "next/image";
import Link from "next/link";

export default function Page() {

    const content = refineSeasonData(exampleSeasonDetails);

    const metadata = [
        { label: 'Rating', value: `${content.rating}/10` },
        { label: 'Year', value: new Date(content.release_date).getFullYear() },
    ]

    return <>
        <Container backdrop="" poster={content.poster} link="" metadata={metadata} >
            <h1 className="text-7xl uppercase font-semibold">{content.title}</h1>
            <p className="my-4 text-zinc-500">{content.overview}</p>
            <div className="mb-6 space-y-3">
                <h2 className="text-xl uppercase font-semibold">Top Cast</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {content.cast.map(el => (
                        <ContentBox key={el.id} title={el.name} detail={el.character} img={el.poster} link={`/explore/person/${el.id}-${refineString(el.name)}`} />
                    ))}
                </div>
            </div>
            <div className="mb-6 space-y-3">
                <h2 className="text-xl uppercase font-semibold">Episodes</h2>
                <ul className="flex gap-4 overflow-x-auto pb-2">
                    {content.episodes.map(el => (
                        <li className="min-w-80 w-80" key={el.id}>
                            <Image className="w-full aspect-video mb-2" src={getPoster("still", el.poster, 3)} alt="" height={500} width={500} />
                            <Link href={`season-${content.season_number}/episode-${el.episode_number}`}>
                                <h2 className="text-xl font-semibold uppercase">{el.title}</h2>
                            </Link>
                            <p className="my-2 text-zinc-500">{el.overview}</p>
                            <p>
                                <span>{new Date(el.release_date).getFullYear()}</span>
                                {" - "}
                                <span>{el.rating}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    </>
}