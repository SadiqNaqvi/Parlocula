'use client';

import { GenericWrapper, Navbar } from "@components";
import CommentInput from "@components/CommentInput";
import { NotFound, ShowError } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import { getCommentById } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useCurrentUser from "@store/user";
import { FullComment } from "@type/internal";

type Props = { id: string };

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("comment_cid", { cid: id }),
    queryFn: getCommentById,
    args: [id],
});

const EditComment = ({ id }: Props) => {
    const currentUser = useCurrentUser();

    const component = (data: FullComment, { id }: Props) => {

        const { user, isHydrated } = currentUser;

        if (!isHydrated) return <FullPageLoadingSpinner path={[]} />

        else if (!user) return <ShowError heading="You're not allowed to edit a comment." errCode="pp201" />

        else if (user._id !== data.user_id) return <NotFound title="Oops! Looks like you came across a wrong path" paras={[""]} />

        return (
            <>
                <Navbar navTitle="Edit Comment" />
                <CommentInput queryKeys={getQueryKeys("comment_cid", { cid: id })} isEditing={true} defaultVals={data} />
            </>
        )
    }

    return <GenericWrapper props={{ id }} component={component} getQueryProps={getQueryProps} />
};

export default EditComment;