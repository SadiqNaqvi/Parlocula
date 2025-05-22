export default function Loading() {
    return (
        <main className="max-h-dvh overflow-hidden">
            <div className="h-44 sm:h-44 bg-gray30"></div>
            <section className="-mt-6 bg-primarylight pb-6 px-4">
                <div className="max-w-screen-lg mx-auto">
                    <div className="w-20 sm:w-40 ml-2 sm:ml-0 aspect-square border-4 bg-gray-500 border-primary rounded-full translate-y-[-50%]"></div>
                    <div className="-mt-8 sm:-mt-14 h-8 sm:h-10 bg-gray30 w-[90%] sm:w-[60%] rounded-md"></div>
                    <div className="h-6 mt-2 w-[40%] bg-gray30 rounded-md"></div>
                    <div className="h-4 mt-6 w-[80%] sm:w-[60%] bg-gray30 rounded-md"></div>
                    <div className="h-4 mt-2 w-[60%] sm:w-[40%] bg-gray30 rounded-md"></div>
                    <div className="h-4 mt-2 w-[40%] sm:w-[20%] bg-gray30 rounded-md"></div>
                    <div className="h-10 w-full flex mt-6 space-x-4 sm:w-[40%]">
                        <div className="h-full flex-1 sm:w-[50%] rounded-md bg-gray30"></div>
                        <div className="h-full flex-1 sm:w-[50%] rounded-md bg-gray30"></div>
                        <div className="h-full aspect-square rounded-md bg-gray30"></div>
                    </div>
                </div>
            </section>
            <section className="mt-4 bg-primarylight p-4">
                <div className="max-w-screen-lg mx-auto">
                    <div className="flex gap-4">
                        <div className="w-20 h-8 rounded-md bg-gray30"></div>
                        <div className="w-20 h-8 rounded-md bg-gray30"></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Array(5).fill(1).map((_, ind: number) => (
                            <div className="aspect-[2/3] bg-gray30" key={ind}></div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}