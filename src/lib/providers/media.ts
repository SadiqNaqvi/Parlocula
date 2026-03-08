"use server";
import 'server-only'
import { promises } from "fs";
import { handleArrayForArrayResponse, parseResponse, ParseResponseType } from "@lib/utils";
import FormData from "form-data";
import { File as FormidableFile } from "formidable";

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

const getFromDiskAndUpload = async (file: FormidableFile, uri: string, apiKey: string) => {

    console.log("entered getFromDiskAndUpload");
    const fileBuff = (await promises.readFile(file.filepath)).buffer;
    console.log("got file buffer");

    const form = new FormData();
    form.append("files", new Blob([fileBuff]), "filename.jpg");
    console.log("created formData");

    const headers = new Headers(form.getHeaders());
    headers.append("Authorization", `Bearer ${apiKey}`);

    console.log("about to upload now");
    return await fetch(`${uri}/upload`, {
        method: "POST",
        headers,
        body: fileBuff
    }).then(parseResponse) as ParseResponseType<QCoreCloudResponse<UploadResponse[]>>;

}

export const uploadMediaFiles = async <T extends FormidableFile | FormidableFile[]>(file: T) => {
    const files = (!file ? [] : Array.isArray(file) ? file : [file]) as FormidableFile[];
    console.log("entered media upload with files:", files.length);

    if (!files || !files.length)
        throw new Error("Files are requred to upload");

    const uri = process.env.QCORE_CLOUD_UPLOAD_URI;
    const apiKey = process.env.QCORE_CLOUD_AUTH_KEY;
    if (!uri) throw new Error("QCORE_CLOUD_UPLOAD_URI env variable is undefined!");
    else if (!apiKey) throw new Error("QCORE_CLOUD_AUTH_KEY env variable is undefined!");

    let results: UploadResponse[] = [];

    try {
        await Promise.all(files.map(file => getFromDiskAndUpload(file, uri, apiKey)
            .then(({ json, ok, status, text }) => {

                if (!ok || !json) {
                    throw new Error(`Media Upload Failed, Response = ${text}`);
                }
                else if (!json.success) {
                    throw new Error(`Media Upload Failed, ${json.error}`);
                }

                results = [...results, ...json.result];
            })
        ));

        return handleArrayForArrayResponse(file, results);
    } catch (err) {
        console.warn("Error in files upload", err);
        deleteMediaFiles(results.map(r => r.path));
        return [];
    }
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