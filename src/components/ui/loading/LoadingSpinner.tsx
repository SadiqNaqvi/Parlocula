import Navbar from "@components/Navbar";

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
    <div className={`w-full ${className}`}>
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