const MockupShelfBar = () => (
    <article className="flex items-center gap-3 py-2 px-4 border border-gray30 rounded-md">

        <span className="size-12 bg-gray60 rounded-full"></span>

        <div>
            <div className="h-4 rounded-md bg-gray60 w-1/2"></div>
            <div className="mt-2 flex gap-2">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-2 w-10 rounded-md bg-gray60"></div>
                ))}
            </div>
        </div>
    </article>
)

export default MockupShelfBar;