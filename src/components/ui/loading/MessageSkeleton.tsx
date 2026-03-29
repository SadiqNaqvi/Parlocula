import { RandomHorizontalLinesSkeleton } from "./tools";

const MessageSkeleton = () => (
    <li className="group w-full p-2">
        <RandomHorizontalLinesSkeleton
            count={3}
            className="h-3"
            containerClassName="w-full flex flex-col group-even:items-end"
            width="50%"
        />
    </li>
)

export const MessagePageSkeleton = ({ count = 8 }: { count?: number }) => (
    <ul>
        {Array(count).fill(0).map((_, i) => (
            <MessageSkeleton key={i} />
        ))}
    </ul>
)

export default MessageSkeleton;