import { handleArrayForArrayResponse, parseResponse, ParseResponseType } from "@lib/utils";

type NsfwEnum = "Yes" | "No" | "Possible";
type MediaType = "image" | "video";
type QCoreCloudResponse<T> = {
    success: false,
    error: string
} | {
    success: true,
    result: T
}

type UploadResponse = {
    nsfw: NsfwEnum;
    resource_type: MediaType;
    size: number;
    path: string;
}

export const uploadMediaFiles = async <T extends File | File[]>(file: T) => {
    const files = (!file ? [] : Array.isArray(file) ? file : [file]) as File[];
    if (!files || !files.length)
        throw new Error("Files are requred to upload");

    const uri = process.env.QCORE_CLOUD_URI;
    const apiKey = process.env.QCORE_CLOUD_AUTH_KEY;
    if (!uri) throw new Error("QCORE_CLOUD_URI env variable is undefined!");
    else if (!apiKey) throw new Error("QCORE_CLOUD_AUTH_KEY env variable is undefined!");

    const fd = new FormData();
    files.forEach(file => fd.append("files", file));

    const { json, ok, text } = await fetch(`${uri}/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
        },
        body: fd
    }).then(parseResponse) as ParseResponseType<QCoreCloudResponse<UploadResponse[]>>;

    if (!ok || !json) {
        throw new Error(`Media Upload Failed, Response = ${text}`);
    }
    else if (!json.success) {
        throw new Error(`Media Upload Failed, ${json.error}`);
    }

    else return handleArrayForArrayResponse(file, json.result);

}

export const deleteMediaFiles = async (path: string | string[]) => {
    const paths: string[] = !path ? [] : Array.isArray(path) ? path : [path];
    if (!paths || !paths.length) return [];

    const uri = process.env.QCORE_CLOUD_URI;
    const apiKey = process.env.QCORE_CLOUD_AUTH_KEY;
    if (!uri) throw new Error("QCORE_CLOUD_URI env variable is undefined!");
    else if (!apiKey) throw new Error("QCORE_CLOUD_AUTH_KEY env variable is undefined!");

    const { json, ok, status, text } = await fetch(`${uri}/delete`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ paths })
    }).then(parseResponse) as ParseResponseType<QCoreCloudResponse<any>>;

}