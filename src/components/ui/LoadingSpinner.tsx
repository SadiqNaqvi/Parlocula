import { LeftChevron } from "@assets/Icons";

const LoadingSpinner = () => (
    <div className="stretchContainer w-full">
        <div className="loadingSpinner"></div>
    </div>
)

export default LoadingSpinner;

export const FullPageLoadingSpinner = ({ path }: { path: string[] }) => {
    const name = path.join(' ');

    return (
        <section className="size-screen flex flex-cntr-all">
            <div className="py-4 flex gap-4 w-full">
                <LeftChevron />
                <h1 className="text-2xl capitalize">{name}</h1>
            </div>
            <LoadingSpinner />
        </section>
    )
}