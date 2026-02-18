import Navbar from "@components/Navbar";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ className, spinnerClassName }: { className?: string, spinnerClassName?: string }) => (
    <div role="status" data-testid="loadingSpinner" className={twMerge("h-size-screen flex flex-cntr-all", className)}>
        <div className={twMerge("size-12 border-4 border-gray-500/30 border-l-[var(--secondary)] rounded-full animate-spin", spinnerClassName)}></div>
    </div>
)

export default LoadingSpinner;

export const FullPageLoadingSpinner = ({ path }: { path?: string[] }) => {
    const name = path?.join(' ');

    return (
        <section className="h-size-screen">
            <Navbar navTitle={decodeURI(name || '')} />
            <div className="forceCenter">
                <LoadingSpinner />
            </div>
        </section>
    )
}