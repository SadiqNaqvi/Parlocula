import Container from "@app/explore/exploreComponents/container";
import { refineEpisodeData } from "@lib/dataRefiner";
import { exampleEpisodeDetails } from "@lib/sampleData";

export default function Page() {

    const content = refineEpisodeData(exampleEpisodeDetails)

    const metadata = [
        { label: "Rating", value: content.rating },
        { label: "Year", value: new Date(content.release_date).getFullYear().toString() },
    ]

    return (
        <Container content={content} metadata={metadata}>
            {"lala"}
        </Container>
    )
}