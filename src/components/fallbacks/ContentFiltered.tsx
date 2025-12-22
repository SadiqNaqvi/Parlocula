import Navbar from "@components/Navbar";
import Navigate from "@components/Navigate";

const ContentFiltered = ({ skipFullScreen }: { skipFullScreen?: boolean }) => {
    return (
        <div className={`flex flex-col ${skipFullScreen ? "h-size-screen" : "h-stretch"}`}>
            {!skipFullScreen && (
                <Navbar />
            )}
            <section className="max-w-80 m-auto">
                <h4 className="text-lg mb-2">Oops! Looks like you have been stopped by The Parlocula Guards</h4>
                <div className="space-y-2">
                    <p className="text-zinc-500">This content has been filtered out because it may contain explicit content.</p>
                    <p className="text-zinc-500">You can either update settings or Explore other contents</p>
                </div>
                <div className="mt-3 flex gap-2">
                    <Navigate
                        className="btn primary flex-1"
                        type="button"
                        comp="link"
                        goto="/explore">
                        Let{"'"}s Explore
                    </Navigate>
                    <Navigate
                        className="btn primary flex-1"
                        type="button"
                        comp="link"
                        goto="/settings/filter_contents">
                        Update Settings
                    </Navigate>
                </div>
            </section>
        </div>
    )
}

export default ContentFiltered;