import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import OptionalChildren from "../OptionalChildren";
import Navbar from "@components/Navbar";

export const HeadingSkeleton = ({ className }: { className?: string }) => (
    <div className={twMerge("w-20 h-4 skeletonPulse rounded-full", className)}></div>
)

export const PosterSkeleton = ({ className }: { className?: string }) => (
    <div className={twMerge("size-10 skeletonPulse rounded-full", className)}></div>
)

export const FramesSkeleton = ({ className, containerClassName, count = 1 }: { className?: string, containerClassName?: string, count?: number }) => (
    <ul className={twMerge("flex gap-2 overflow-hidden", containerClassName)}>
        {Array(count).fill(0).map((_, i) => (
            <li className={twMerge("h-auto aspect-square skeletonPulse rounded-md", className)} key={i}></li>
        ))}
    </ul>
)
export const MetaDataSkeleton = ({ className, containerClassName, count = 1 }: { className?: string, containerClassName?: string, count?: number }) => (
    <ul className={twMerge("flex gap-2", containerClassName)}>
        {Array(count).fill(0).map((_, i) => (
            <li key={i} className={twMerge("w-10 h-2 skeletonPulse rounded-full", className)}></li>
        ))}
    </ul>
)

export const TabListSkeleton = ({ className, containerClassName, count = 2 }: { className?: string, containerClassName?: string, count?: number }) => (
    <ul className={twMerge("flex gap-2 overflow-x-hidden", containerClassName)}>
        {Array(count).fill(0).map((_, i) => (
            <li key={i} className={twMerge("flex-1 min-w-[24%] p-2 border-b-2 border-gray30", className)}>
                <div className="h-4 w-full rounded-full skeletonPulse"></div>
            </li>
        ))}
    </ul>
)

export const ButtonSkeleton = ({ className }: { className?: string }) => (
    <div className={twMerge("rounded-md skeletonPulse h-10 w-24 flex-1 sm:flex-none max-w-full", className)}></div>
)

export const SmallButtonSkeleton = ({ className }: { className?: string }) => (
    <div className={twMerge("rounded-md skeletonPulse size-5", className)}></div>
)

export const RandomHorizontalLinesSkeleton = ({ className, containerClassName, count = 1, width }: { className?: string, containerClassName?: string, count?: number, width?: string }) => (
    <ul className={twMerge("space-y-1", containerClassName)}>
        {Array(count).fill(0).map((_, i) => (
            <li
                style={{
                    width: `calc(${width ?? "80%"} / ${i + 1})`
                }}
                key={i}
                className={twMerge("h-2 skeletonPulse rounded-full", className)}></li>
        ))}
    </ul>
)

export const NavbarSkeleton = ({ heading, removeBackButton }: { heading?: string, removeBackButton?: boolean }) => (
    <div className="h-15 px-2 w-full border-b border-gray30 flex flex-cntr-between">
        <div className="flex items-center gap-2">
            <OptionalChildren condition={!removeBackButton}>
                <SmallButtonSkeleton />
            </OptionalChildren>
            <OptionalChildren condition={heading} fallback={<HeadingSkeleton />}>
                <h1>{heading}</h1>
            </OptionalChildren>
        </div>
        <div className="flex gap-2">
            <SmallButtonSkeleton />
            <SmallButtonSkeleton />
        </div>
    </div>
)

export const PageWrapper = ({ children, heading }: PropsWithChildren<{ heading?: string }>) => (
    <>
        {/* <NavbarSkeleton heading={heading} /> */}
        <Navbar navTitle={heading} />
        <section className="w-full max-w-3xl mx-auto">
            {children}
        </section>
    </>
)