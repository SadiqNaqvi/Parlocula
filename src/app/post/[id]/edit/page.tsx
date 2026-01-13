"use client";

import { CreateEditPost, GenericWrapper } from "@components";
import { CreateEditPostReturn } from "@components/CreateEditPost";
import LoginModal from "@components/fallbacks/LoginModal";
import { NotFound } from "@components/ui";
import { getPostById } from "@lib/helpers/common";
import { updatePostMutation } from "@lib/helpers/mutations";
import { checkEditedFields, getQueryKeys, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { FullPost } from "@type/internal";
import { ParloPageProps } from "@type/other";
import { InputFrame } from "@type/schemas";
import { useParams } from "next/navigation";

type Props = { id: string }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("post_id", { id }),
    queryFn: getPostById,
    args: [id],
});

const Page = () => {

    const { id } = useParams() as { id: string };

    const { meta } = useCurrentUser();
    const navigation = useNavigation();

    const Component = (data: FullPost) => {

        if (!meta) return (
            <LoginModal />
        )

        else if (meta.user_id !== data.user_id) return (
            <NotFound
                title="The Parlocula Guards Stopped You"
                paras={[
                    "Seems like you are not the author of the post."
                ]}
            />
        )

        const frames: InputFrame[] = data.frames.map((frame) => ({
            ...frame,
            isExternal: true,
            blob: null,
            shouldUpload: false,
        }));

        const callback = async (updatedData: CreateEditPostReturn) => {
            const { frames, ...others } = updatedData;

            const editedFields = checkEditedFields(others, updatedData);

            const removedFrames = data.frames.filter(
                ({ isExternal, path }) => !Boolean(frames.find(frame => frame.path === path) || isExternal)
            ).map(({ path, type }) => ({ path, type }));

            const { files, filesData } = await readyFrames(frames);

            updatePostMutation(
                id,
                meta.user_id,
                { ...editedFields, files, filesData, filesToRemove: removedFrames },
                data.thread_id,
            );
            navigation.replace(`/post/${id}`);
        };

        return <CreateEditPost
            callback={callback}
            isEditing={true}
            defaultVal={{ ...data, frames }}
            defaultThread={undefined}
            titleOfQuotedPost={undefined}
        />

    }

    return <GenericWrapper props={{ id }} component={Component} getQueryProps={getQueryProps} />
};

export default Page;