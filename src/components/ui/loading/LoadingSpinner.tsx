import Navbar from "@components/Navbar";
import { twMerge } from "tailwind-merge";

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
    <div role="status" data-testid="loadingSpinner" className={twMerge("h-[50dvh] flex flex-cntr-all", className)}>
        <div className="loadingSpinner"></div>
    </div>
)

export default LoadingSpinner;

export const FullPageLoadingSpinner = ({ path }: { path?: string[] }) => {
    const name = path?.join(' ');

    return (
        <section className="h-size-screen">
            <Navbar navTitle={name} />
            <div className="forceCenter">
                <LoadingSpinner />
            </div>
        </section>
    )
}