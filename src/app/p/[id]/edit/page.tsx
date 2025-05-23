"use client";

import { CreateEditPost, GenericWrapper } from "@components";
import { LoadingSpinner, NotFound, ShowError } from "@components/ui";
import { numberOfFrames } from "@lib/constants";
import { updatePost } from "@lib/helpers/client";
import { getPostById } from "@lib/helpers/common";
import { getQueryKeys, readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useQueryClient } from "@tanstack/react-query";
import { FullPost } from "@type/internal";
import { useRouter } from "@type/nextjs";
import { InputFrame } from "@type/schemas";

type Props = { id: string }

const getQueryProps = ({ id }: Props) => ({
    queryKeys: getQueryKeys("post_id", { id }),
    queryFn: getPostById,
    args: [id],
});

// Motive is to keep media uploaded videos to 2 and check for media uploaded frames to remove.
const validateFrames = (oldFrames: Omit<InputFrame, "shouldUpload" | "blob">[], newFrames: InputFrame[]) => {

    const oldvideoCount = oldFrames.filter(f => !f.isExternal && f.type === "video").length;
    const newvideoCount = newFrames.filter(f => !f.isExternal && f.type === "video").length;
    if ((oldvideoCount + newvideoCount) > numberOfFrames.videos) return { success: false, error: `Only ${numberOfFrames.videos} media uploaded videos are allowed.` }

    const removed: any[] = [];
    const newFramesMap = new Map<string, "image" | "video">(newFrames.map(el => [el.path, el.type]))

    oldFrames.forEach(({ isExternal, path, type }) => {
        if (newFramesMap.get(path)) { newFramesMap.delete(path); return; }
        console.log(path)
        if (!isExternal) removed.push({ path, type });
    });

    return { success: true, removed, framesUpdated: Boolean(newFramesMap.size || removed.length) }

}

const Page = ({ params: { id } }: { params: { id: string } }) => {
    const currentUser = useCurrentUser();
    const router = useRouter();
    const queryClient = useQueryClient();

    const component = (data: FullPost, { id }: Props) => {

        const { user, isHydrated } = currentUser;

        if (!isHydrated) return <LoadingSpinner />

        else if (!user) return <ShowError heading="You're not allowed to edit a post." errCode="pp201" />

        else if (user._id !== data.user_id) return <NotFound title="Oops! Looks like you came across a wrong path" paras={[""]} />

        const frames = data.frames.map(({ path, type }) => ({
            type,
            path,
            isExternal: true as true,
            blob: null,
            shouldUpload: false
        }));

        const callback = async (updatedData: any) => {
            const updatesToSend: Record<string, any> = {};

            const { frames, ...others } = updatedData;
            Object.keys(others).forEach(k => {
                if (JSON.stringify(updatedData[k]) !== JSON.stringify((data as Record<string, any>)[k])) {
                    updatesToSend[k] = updatedData[k];
                }
            });

            const { success, removed, error, framesUpdated } = validateFrames(data.frames, frames);
            if (!success) return error;

            if (framesUpdated) {
                const { files, filesData } = await readyFrames(frames)
                updatesToSend.files = files;
                updatesToSend.filesData = filesData;
            }
            updatesToSend.filesToRemove = removed ?? [];

            return await updatePost(id, user._id, updatesToSend, router, queryClient);
        };

        return <CreateEditPost goBack={undefined} callback={callback} isEditing={true} defaultVals={{ ...data, frames }} />

    }

    return <GenericWrapper props={{ id }} component={component} getQueryProps={getQueryProps} />
};

export default Page;