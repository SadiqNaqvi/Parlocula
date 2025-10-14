import Image from "next/image";
import AppLogo from "@assets/logo.png"

const MainLoader = () => (
    <div className="bg-gray-900 size-screen flex flex-cntr-all">
        <div>
            <div className="mx-auto relative size-12 sm:size-24">
                <Image
                    layout="fill"
                    alt="App Logo"
                    src={AppLogo.src}
                />
            </div>
            <h1 className="mt-6 text-xl sm:text-3xl">Popcorn Paragon</h1>
        </div>
        <div className="w-full absolute left-[50%] -translate-x-[50%] bottom-10 text-center">
            <div className="mx-auto">by</div>
            <div className="mt-4 text-xl sm:text-3xl">Q-Core Technologies</div>
        </div>
    </div>
)

export default MainLoader;