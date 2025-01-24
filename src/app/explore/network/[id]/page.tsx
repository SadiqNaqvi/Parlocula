import LayoutContainer from "@app/explore/exploreComponents/LayoutContainer";
import { refineCompanyData } from "@lib/dataRefiner";
import { exampleNetworkDetails } from "@lib/sampleData";

export default function Page() {

    const content = refineCompanyData(exampleNetworkDetails);

    return (
        <>
            <LayoutContainer backdrop="" poster={content.poster} poster_type="logo" poster_classname="object-contain object-center">
                <h1 className="text-2xl sm:text-4xl uppercase font-semibold">{content.title}</h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Headquarters at: {content.headquarters}</p>
                {content.description && <p className="mt-4">{content.description}</p>}
                <p className="mt-4">Homepage: {" "}
                    <a href={content.homepage} target="_blank" className="text-sky-500">{content.homepage}</a>
                </p>
            </LayoutContainer>
        </>
    )
}