import Link from "next/link";

export default function Home() {

  return (
    <>
      <header
        id="landingpageHeader"
        className="h-full px-20 flex flex-col flex-cntr-all"
      >
        <h1 className="text-4xl font-thin text-center">Popcorn Paragon</h1>
        <h2 className="text-2xl mt-5 text-center">
          Stop Scrolling, Start Watching
        </h2>
        <p className="my-2 px-20 text-center text-zinc-400">
          Tired of spending hours browsing through endless movie lists, only to
          end up feeling overwhelmed and indecisive? Popcorn Paragon is here to
          revolutionize your movie-watching experience!
        </p>
        <p className="text-center text-zinc-400">
          Discover your next cinematic obsession with personalized
          recommendations curated just for you.
        </p>
        <Link href="/generate" className="mt-5">
          <button className="primary">Generate</button>
        </Link>
      </header>
    </>
  );
}
