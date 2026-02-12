import Navbar from "@components/Navbar";
import { OptionalChildren, VerticleMovieCardSkeleton } from "..";

type Props = {
    title?: string;
    backdrop: boolean;

}

const animationClasses = "skeleton-pulse-loading";

const TitleSkeleton = () => (
    <div className={`h-5 sm:h-9 w-full max-w-96 rounded-md ${animationClasses}`}></div>
)

const DescriptionSkeleton = ({ lines = 3 }: { lines?: number }) => (
    <ul className="w-full space-y-2">
        {Array(lines).fill(0).map((_, i) => (
            <li key={i} style={{ width: (100 / (i + 1)) + "%" }} className={`h-2 rounded-md ${animationClasses}`}></li>
        ))}
    </ul>
)

const secondaryButtoClasses = "border-2 border-primarylight animate-pulse"

const ButtonSkeleton = ({ primary, secondary }: { primary?: boolean, secondary?: boolean }) => (
    <div className={`flex-1 sm:max-w-32 h-12 rounded-md ${primary ? animationClasses : ''} ${secondary ? secondaryButtoClasses : ''}`}></div>
)

const TaleonWikiSectionSkeleton = () => (
    <section className="my-4 py-4 px-2 sm:px-4 space-y-3">
        <div className="flex flex-cntr-between">
            <span className={`rounded-md w-24 h-4 ${animationClasses}`}></span>
        </div>
        <ul className="flex gap-2 overflow-x-hidden">
            {Array(6).fill(0).map((_, i) => (
                <li key={i}>
                    <VerticleMovieCardSkeleton />
                </li>
            ))}
        </ul>
    </section>
)

const TaleonWikiSkeleton = ({ backdrop, title }: Props) => (
    <>
        <Navbar />
        <header className="mt-2 pb-4 border-b px-2 sm:px-4 border-gray30">
            <OptionalChildren condition={backdrop}>
                <section className={`w-full h-auto rounded-md aspect-[16/9] max-h-[250px] ${animationClasses}`}>
                </section>
            </OptionalChildren>

            <section className={`flex relative w-full gap-2 sm:gap-4 ${backdrop ? "items-end pl-4" : "items-center"}`}>
                <div className={`${backdrop ? "absolute -translate-y-[50%] top-0" : ''} ${animationClasses} border-4 border-primary min-w-24 size-24 sm:min-w-40 sm:size-40 rounded-full`}></div>
                <div className={`w-full space-y-2 ${backdrop ? "mt-4 pl-28 sm:pl-44" : ''}`}>
                    <OptionalChildren condition={title} fallback={<TitleSkeleton />}>
                        <h1 className="text-xl sm:text-3xl line-clamp-2 font-semibold capitalize">
                            {decodeURI(title || '')}
                        </h1>
                    </OptionalChildren>

                    <div className={`min-w-[50px] max-w-48 w-[50%] h-2 rounded-md ${animationClasses}`}></div>
                </div>
            </section>

            <section className="mt-6">
                <DescriptionSkeleton />
            </section>

            <section className="mt-4 flex gap-2">
                <ButtonSkeleton primary />
                <ButtonSkeleton secondary />
            </section>
        </header>
        <TaleonWikiSectionSkeleton />
        <TaleonWikiSectionSkeleton />
    </>
)

export default TaleonWikiSkeleton;