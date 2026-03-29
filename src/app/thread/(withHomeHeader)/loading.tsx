import { ThreadListSkeleton } from "@components/ui/loading";

const Loading = () => (
    <main>
        <ThreadListSkeleton count={12} />
    </main>
);

export default Loading;