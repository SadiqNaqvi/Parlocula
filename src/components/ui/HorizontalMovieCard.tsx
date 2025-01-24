"use Client";

import { getPoster } from "@lib/dataRefiner"
import { RefinedGeneralContentData } from "@lib/types";
import Image from "next/image"

export const LoadingHorizontalMovieCard = () => (
    <div className="w-full h-72 flex gap-4 p-4 rounded-md border border-gray40">
        <div className="w-[70%]">
            <div className="h-10 w-[60%] skeletonLoading rounded-xl"></div>
            <div className="mt-3 space-x-4 flex">
                <span className="h-8 w-16 skeletonLoading rounded-md block"></span>
                <span className="h-8 w-16 skeletonLoading rounded-md block"></span>
            </div>
            <div className="mt-6 space-y-2">
                <div className="h-4 rounded-xl w-[80%] skeletonLoading"></div>
                <div className="h-4 rounded-xl w-[60%] skeletonLoading"></div>
                <div className="h-4 rounded-xl w-[40%] skeletonLoading"></div>
            </div>
        </div>
        <div className="w-[30%] h-full rounded-md skeletonLoading"></div>
    </div>
)

export default function HorizontalMovieCard({ overview, poster, rating, release_date, title, }: RefinedGeneralContentData) {
    return (
        <article className="flex w-full h-72 gap-4 rounded-md border border-gray40 overflow-hidden">
            <section className="w-[65%] p-4">
                <h3 className="text-4xl uppercase font-semibold line-clamp-2">{title}</h3>
                <div className="mt-3 space-x-4">
                    <span className="py-2 px-3 border border-gray30 rounded-md">{rating}/10</span>
                    <span>{new Date(release_date).getFullYear()}</span>
                </div>
                <p className="mt-5 line-clamp-5">{overview}</p>
            </section>
            <section className="w-[35%] relative">
                <div className="primary-gradient"></div>
                <Image className="w-[90%] h-full ml-auto object-cover object-top" src={getPoster("poster", poster, 3)} alt={"Poster of " + title} height={500} width={500} loading="lazy" />
            </section>
        </article>
    )
}