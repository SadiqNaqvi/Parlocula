import { DataFetcher, Navigate, ObserverHeader } from "@components";
import { AllowedFunctionsForHorizontalList, HorizontalMovieListProps } from "@components/DataFetcher";
import { InteractiveDetailSection, OptionalChildren, ParloImage } from "@components/ui";
import { Link } from "@type/internal";
import { ExternalImageType } from "@type/other";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type HeaderProps = {
    title: `${string}`;
    poster: `${string}`;
    backdrop?: `${string}`;
    titleSupport?: React.ReactNode;
    wikiMeta?: { value: string | number, label: string }[];
    overviewOrBio?: string;
    descriptionSupport?: React.ReactNode;
    callToActions?: React.ReactNode;
    className?: string;
    posterClassName?: string;
    titleToShare?: string;
    frameType: Extract<ExternalImageType, "poster" | "profile" | "logo">;
}

const TaleonWikiHeader = ({ className, posterClassName, title, frameType, titleToShare, poster, backdrop, descriptionSupport, titleSupport, overviewOrBio, wikiMeta, callToActions }: HeaderProps) => (
    <>
        <ObserverHeader
            titleToShare={titleToShare || `Check out ${title} on Parlocula`}
            navTitle={title}
            className={twMerge("px-2 sm:px-4 border-b border-gray30 pb-4 mt-2", className)}
        >
            <OptionalChildren condition={backdrop}>
                <section className="w-full">
                    <ParloImage
                        fancyGallery="backdrop for the wiki"
                        fileNameToDownload={`Cover Image of ${title} - Parlocula`}
                        frameType="backdrop"
                        containerClassName="w-full"
                        width={768}
                        height={300}
                        prioritize
                        sizes={[
                            { maxScreenWidth: 768, imageWidth: "100vw" },
                            { imageWidth: 768 },
                        ]}
                        className={twMerge("w-full rounded-md aspect-video h-auto max-h-[250px] object-cover object-top")}
                        alt={`Cover Image of ${title}`}
                        frame={backdrop}
                    />
                </section>
            </OptionalChildren>

            <section className={`relative flex gap-2 sm:gap-4 ${backdrop ? "items-end pl-4" : "items-center"}`}>

                <ParloImage
                    frameType={frameType}
                    height={160}
                    width={160}
                    prioritize
                    className={twMerge(`${backdrop ? "absolute -translate-y-[50%] top-0 border-4 border-primary" : ''} object-cover min-w-24 size-24 sm:min-w-40 sm:size-40 rounded-full`, posterClassName)}
                    alt={`Poster Image of ${title}`}
                    frame={poster}
                    sizes={[
                        { maxScreenWidth: 480, imageWidth: 96 },
                        { imageWidth: 160 },
                    ]}
                    fancyGallery="taleon_poster"
                    fileNameToDownload={`Poster of ${title} - Parlocula`}
                />

                <div className={`w-full ${backdrop ? "mt-2 pl-24 sm:pl-40" : ''}`}>
                    <h1 data-observe className="selectable text-lg xs:text-xl sm:text-3xl line-clamp-2 font-semibold capitalize">{title}</h1>
                    {titleSupport}
                </div>
            </section>

            <section className={backdrop ? "mt-6 mb-4" : 'my-4'}>
                <OptionalChildren condition={wikiMeta?.length}>
                    <ul className={"flex gap-2 mb-4"}>
                        {wikiMeta?.map(el => (
                            <li key={el.label} className="gap-1 md:gap-2 flex flex-col flex-cntr-all">
                                <strong>{el.value}</strong>
                                <span className="text-zinc-500 text-sm">{el.label}</span>
                            </li>
                        ))}
                    </ul>
                </OptionalChildren>

                <InteractiveDetailSection className="text-sm text-zinc-500">
                    {overviewOrBio}
                </InteractiveDetailSection>
                {descriptionSupport}
            </section>

            <OptionalChildren condition={callToActions}>
                {callToActions}
            </OptionalChildren>

        </ObserverHeader>
    </>
)

type SectionProps<T extends AllowedFunctionsForHorizontalList> = {
    heading: string;
    moreButton?: Link;
    horizontalMovieListProps?: HorizontalMovieListProps<T>;
    className?: string;
}

export const TaleonWikiSection = <T extends AllowedFunctionsForHorizontalList>({ className, heading, moreButton, children, horizontalMovieListProps }: PropsWithChildren<SectionProps<T>>) => (

    <section className={twMerge("space-y-2 px-2 sm:px-4 border-b last:border-b-0 border-gray30 xs:border-0 my-4 py-4", className)}>
        <div className={`${moreButton ? "flex flex-cntr-between" : ''}`}>
            <h2 className="parloHeading">{heading}</h2>
            <OptionalChildren condition={moreButton}>
                <Navigate comp="link" role="button" className="text-sm" goto={moreButton?.path!}>
                    {moreButton?.label}
                </Navigate>
            </OptionalChildren>
        </div>

        <OptionalChildren condition={horizontalMovieListProps} fallback={children}>
            <DataFetcher {...horizontalMovieListProps!} />
        </OptionalChildren>

    </section>
)

export default TaleonWikiHeader;