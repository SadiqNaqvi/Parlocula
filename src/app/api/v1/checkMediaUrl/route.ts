import { binaryToBase64 } from "@lib/helpers/media";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

const createThumbHash = async (buffer: ArrayBuffer) => {
    const { data, info } = await sharp(buffer)
        .resize(100, 100, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    // 3️⃣ Generate thumbhash
    return binaryToBase64(rgbaToThumbHash(info.width, info.height, data));

}

const workOnWebMedia = async (resp: Response) => {
    const body = await resp.blob();
    const { type, size } = body;

    const [mime, ext] = type.split('/');

    const hash = mime === "image" ? await createThumbHash(await body.arrayBuffer()) : undefined;

    if (mime === "image" || mime === "video")
        return { size, mime, ext, hash }

    return null;
}

export const GET = async (req: NextRequest) => {

    const { searchParams } = req.nextUrl;

    const source = searchParams.get("source");

    if (!source) return NextResponse.json({
        success: false,
        error: "Source is required",
    }, { status: 400 });

    const path = searchParams.get("path");

    if (!path) return NextResponse.json({
        success: false,
        error: "Path is required"
    }, { status: 400 });

    try {
        if (source === "mega") {
            const key = searchParams.get("key");

            if (!key) return NextResponse.json({
                success: false,
                error: "Key is required for mega."
            }, { status: 400 });

            const url = `${process.env.QCORE_CLOUD_URI}/media/v1/mega/${path}?key=${key}`;

            const resp = await fetch(url, { headers: { range: "bytes=0-100" } });

            if (resp.ok) {

                const headers = new Headers(resp.headers);

                const size = Number(headers.get("Content-Size")) || 0;

                // the header would be like this: "{mime}/{ext}";
                const type = headers.get("Content-type")

                const [mime, ext] = type?.split('/') || ["unknown"];

                const hash = mime === "image" ? await createThumbHash(await fetch(url).then(r => r.arrayBuffer())) : undefined;

                if (mime === "image" || mime === "video")
                    return NextResponse.json({ success: true, result: { size, mime, ext, hash } })

            }

            console.warn("Response while checking mega file:", resp.status, resp.statusText, resp);

        } else if (source === "youtube") {
            const resp = await fetch(`https://youtube.com/oembed?url=${encodeURIComponent(path)}&format=json`)

            if (resp.ok) return NextResponse.json({ success: true, result: await resp.json() });
        } else if (source === "vimeo") {
            const resp = await fetch(path, { method: "HEAD" });

            if (resp.ok) return NextResponse.json({ success: true, result: null });
        } else {
            const url = new URL(path);
            const pathWithoutSParams = url.origin + url.pathname;

            const [respWithSp, respWithoutSp] = await Promise.all([
                fetch(path),
                fetch(pathWithoutSParams),
            ])
            if (respWithoutSp.ok) {
                const result = await workOnWebMedia(respWithoutSp);
                if (result)
                    return NextResponse.json({ success: true, result });
            }
            else if (respWithSp.ok) {
                const result = await workOnWebMedia(respWithSp);
                if (result)
                    return NextResponse.json({ success: true, result });
            }

        }

        return NextResponse.json({ success: false, error: "Nothing could be found" }, { status: 404 });

    } catch (err: any) {
        console.warn("Error occured while checking media url", err.message);
        return NextResponse.json({ success: false, error: "Uncaught error" }, { status: 500 })
    }
}