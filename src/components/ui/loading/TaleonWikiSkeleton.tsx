import Navbar from "@components/Navbar";
import { OptionalChildren } from "..";
import { VerticalTaleonCardSkeletonList } from "./VerticalTaleonCardSkeleton";
import { ButtonSkeleton, HeadingSkeleton, MetaDataSkeleton, PosterSkeleton, RandomHorizontalLinesSkeleton } from "./tools";

type Props = {
    title?: string;
    backdrop: boolean;

}

const TaleonWikiSectionSkeleton = () => (
    <section className="my-4 py-4 px-2 sm:px-4 space-y-3">
        <HeadingSkeleton className="w-24" />
        <VerticalTaleonCardSkeletonList />
    </section>
)

const TaleonWikiSkeleton = ({ backdrop, title }: Props) => (
    <>
        <Navbar />
        <header className="mt-2 pb-4 border-b px-2 sm:px-4 border-gray30">
            <OptionalChildren condition={backdrop}>
                <section className="w-full h-auto rounded-md aspect-video max-h-[250px] skeletonPulse">
                </section>
            </OptionalChildren>

            <section className={`flex relative w-full gap-2 sm:gap-4 ${backdrop ? "items-end pl-4" : "items-center"}`}>
                <PosterSkeleton className={`${backdrop ? "absolute -translate-y-[50%] top-0" : ''} border-4 border-primary min-w-24 size-24 sm:min-w-40 sm:size-40`} />
                <div className={`w-full space-y-2 ${backdrop ? "mt-4 pl-28 sm:pl-44" : ''}`}>
                    <OptionalChildren condition={title} fallback={<HeadingSkeleton className="h-5 sm:h-9 w-full max-w-96" />}>
                        <h1 className="text-xl sm:text-3xl line-clamp-2 font-semibold capitalize">
                            {decodeURI(title || '')}
                        </h1>
                    </OptionalChildren>

                    <MetaDataSkeleton className="min-w-12 max-w-48 w-1/2" />
                </div>
            </section>

            <section className="mt-6">
                <RandomHorizontalLinesSkeleton count={3} />
            </section>

            <section className="mt-4 flex gap-2">
                <ButtonSkeleton />
                <ButtonSkeleton />
            </section>
        </header>
        <TaleonWikiSectionSkeleton />
        <TaleonWikiSectionSkeleton />
    </>
)

export default TaleonWikiSkeleton;