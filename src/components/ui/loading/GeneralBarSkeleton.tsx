import { twMerge } from "tailwind-merge";
import OptionalChildren from "../OptionalChildren";
import { HeadingSkeleton, MetaDataSkeleton, PosterSkeleton, SmallButtonSkeleton } from "./tools";

type BarProps = {
    posterClassname?: string,
    rightSideIcon?: boolean,
    metadataFieldsCount?: number,
}

const GeneralBarSkeleton = ({ posterClassname, rightSideIcon, metadataFieldsCount }: BarProps) => (
    <li className="w-full p-2 flex flex-cntr-between max-w-3xl mx-auto">
        <div className="flex gap-2 items-center">
            <PosterSkeleton className={twMerge("size-10 rounded-full", posterClassname)} />
            <OptionalChildren condition={metadataFieldsCount} fallback={<HeadingSkeleton />}>
                <div className="space-y-1">
                    <HeadingSkeleton />
                    <MetaDataSkeleton count={metadataFieldsCount} />
                </div>
            </OptionalChildren>
        </div>
        <OptionalChildren condition={rightSideIcon}>
            <SmallButtonSkeleton />
        </OptionalChildren>
    </li>
);

export const GeneralBarSkeletonList = ({ count = 12, ...args }: BarProps & { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <GeneralBarSkeleton key={i} {...args} />
        ))}
    </ul>
)

export default GeneralBarSkeleton;