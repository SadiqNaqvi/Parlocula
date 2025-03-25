"use client";

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
    console.log(error);
    return (
        <section className="h-full w-full flex flex-cntr-all">
            <div>
                <h1 className="text-2xl">Oops! Look like something happend while fetching your movie</h1>
                <button onClick={() => reset()}>Try Again</button>
            </div>
        </section>
    )
}