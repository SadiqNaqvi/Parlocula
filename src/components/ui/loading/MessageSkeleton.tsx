const MessageSkeleton = () => (
    <div className="w-full flex flex-col px-2">
        {Array(4).fill(0).map((_, ind) => (
            <section key={ind} className={`my-3 w-1/2 space-y-1 ${ind % 2 === 0 ? "self-end flex flex-col items-end" : ''}`}>
                <>
                    {Array(3).fill(0).map((_, i) => (
                        <div
                            style={{ width: `${30 * (i + 1)}%` }}
                            className="skeleton-pulse-loading h-2 bg-gray40 rounded-md"
                            key={i}>
                        </div>
                    ))}
                </>
            </section>
        ))}
    </div>
)

export default MessageSkeleton;