'use server';

import { connectPPDB } from "./database";
import { formDataToObject, getUser, isValidObjectId } from "@lib/utils"
import { mediaUploader } from "./actions";
import { mediaPostServerSchema, postSchemaServer } from "./schemas";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PostLink from "@model/postLinks_model";
import Post from "@model/posts";
import MediaPost from "@model/mediaPost_model";
import MediaPostLink from "@model/mediaPostLinks_model";

export const createPost = async (data: FormData, thread_id: string) => {

    const user = getUser();
    if (!user)
        return { result: null, error: "Unauthorized! You need to log-in to post in a thread.", success: false }

    if (!isValidObjectId(thread_id))
        return { result: null, success: false, error: "Invalid Thread Id! Please try again later." }

    const ObjectData = formDataToObject(data);
    const parse = postSchemaServer.safeParse(ObjectData);

    if (!parse.success) return { result: null, error: parse.error.errors, success: false };
    const { file, file_type, file_url, title, body, nsfw, spoiler, tag, links } = parse.data;

    const postID: { id: string } = { id: '' };

    try {
        const file_resp = file_type && file ? await mediaUploader(file, {
            format: "webp", resource_type: file_type,
        }) : null;

        if (file_resp && !file_resp.success) return { result: null, error: "Unable to upload your assets. Please check your connection and try again.", success: false }

        const file_id = file_resp ? file_resp.result.public_id : null;

        const dataToStore = {
            title, body, nsfw, spoiler, tag, links, media: file_id || file_url || null, media_type: file_type,
        }

        await connectPPDB();
        const resp = await Post.create(dataToStore);
        postID.id = resp._id;
        await PostLink.create({ thread_id, post_id: resp._id, user_id: user._id });
    } catch (err: any) {
        console.log("Failed to post with thread_id: " + err.message);
        return { result: null, success: false, error: "Unable to post! Please check your connection and try again." }
    }
    revalidatePath(`threads/${thread_id}`);
    postID.id ? redirect(`/threads/${thread_id}/${postID.id}`) : redirect(`/threads/${thread_id}`);
}

export const createMediaPost = async (data: FormData, idWithName: string) => {
    const thread_id = idWithName.split('-')[0];

    const user = getUser();
    if (!user)
        return { result: null, error: "Unauthorized! You need to log-in to post in a thread.", success: false }

    if (!isValidObjectId(thread_id))
        return { result: null, success: false, error: "Invalid Thread Id! Please try again later." }

    const ObjectData = formDataToObject(data);
    const parse = mediaPostServerSchema.safeParse(ObjectData);

    if (!parse.success) return { result: null, error: parse.error.errors, success: false };
    const { file, file_type, file_url, caption, nsfw, spoiler, links } = parse.data;

    if (!file_type || !(file || file_url)) return { result: null, error: "No Attached File.", success: false }

    const postID: { id: string } = { id: '' };

    try {
        const file_resp = file_type && file ? await mediaUploader(file, {
            format: "webp", resource_type: file_type,
        }) : null;

        if (file_resp && !file_resp.success) return { result: null, error: "Unable to upload your asset. Please check your connection and try again.", success: false }

        const file_id = file_resp ? file_resp.result.public_id : null;

        const dataToStore = {
            caption, nsfw, spoiler, links, media: file_id || file_url || null, media_type: file_type,
        }

        await connectPPDB();
        const resp = await MediaPost.create(dataToStore);
        postID.id = resp._id;
        await MediaPostLink.create({ thread_id, post_id: resp._id, user_id: user._id });
    } catch (err: any) {
        console.log("Failed to post with thread_id: " + err.message);
        return { result: null, success: false, error: "Unable to post! Please check your connection and try again." }
    }
    revalidatePath(`threads/${thread_id}`);
    postID.id ? redirect(`/threads/${idWithName}/${postID.id}`) : redirect(`/threads/${thread_id}`);
}