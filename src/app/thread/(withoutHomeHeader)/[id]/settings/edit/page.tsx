import ThreadMutation from "@components/form/Mutation/ThreadMutation";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadById } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";

const ThreadEditPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;
    const [tid] = id.split('-');

    const queryClient = getQueryClient();

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    const thread = await fetchQuery({
        queryClient,
        queryKey: getQueryKeys("thread_id", { id: tid }),
        queryFn: () => getThreadById(tid),
    });

    if (!thread || !(thread.created_by === user.user_id || thread.managers.some(({ _id }) => _id === user.user_id)))
        return null;

    return <ThreadMutation isEditing defaultValues={thread} />
}

export default ThreadEditPage;