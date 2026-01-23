import { AppIcon } from "@assets/Icons";

const MainLoader = () => (
    <div className="size-screen flex flex-cntr-all">
        <div>
            <div className="mx-auto relative">
                <AppIcon className="size-12 md:size-24" />
            </div>
        </div>
        <div className="w-full absolute left-[50%] -translate-x-[50%] bottom-10 text-center">
            <div className="mx-auto">by</div>
            <div className="mt-4 text-xl sm:text-3xl">Q-Core Technologies</div>
        </div>
    </div>
)

export default MainLoader;