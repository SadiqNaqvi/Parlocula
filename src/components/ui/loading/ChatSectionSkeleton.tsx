import MessageSkeleton from "./MessageSkeleton";

const ChatSectionSkeleton = () => (
    <div className="max-h-screen overflow-hidden">
        <header className="sticky top-0 bg-primary border-b border-gray40 flex h-16 px-2 items-center gap-2">
            <span className="size-5 rounded-md skeleton-pulse-loading"></span>
            <div className="flex gap-3 items-center">
                <span className="size-12 rounded-full skeleton-pulse-loading"></span>
                <div className="space-y-1">
                    <div className="w-1/2 skeleton-pulse-loading h-4 rounded-md"></div>
                    <div className="rounded-full h-2 w-20 skeleton-pulse-loading"></div>
                </div>
            </div>
        </header>
        <section className="space-y-2 overflow-hidden">
            {Array(5).fill(0).map((_, i) => (
                <MessageSkeleton key={i} />
            ))}
        </section>
        <footer className="flex gap-2 bg-primary sticky bottom-0 items-center w-full border-t border-gray40 px-2 py-4">
            <div className="p-3 rounded-full flex-1 border border-gray10 bg-gray10 text-zinc-500">
                Send Message
            </div>
            <span className="size-5 rounded-full skeleton-pulse-loading"></span>
        </footer>
    </div>
)

export default ChatSectionSkeleton;