import { NextRequest } from "next/server";
import sharp from "sharp";

export const GET = async (req: NextRequest) => {

    const sp = req.nextUrl.searchParams;
    const url = sp.get("url");
    const width = Number(sp.get("w")) || 0;

    if (!url || !width)
        return new Response("Url and width are required", { status: 400 });

    try {

        const resp = await fetch(decodeURIComponent(url));
        if (!resp.ok) return resp;

        const buffer = await sharp(await resp.arrayBuffer())
            .resize(width, null, {
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 },
                position: sharp.strategy.entropy,
            })
            .webp()
            .toBuffer();

        return new Response(buffer as any);
    } catch (e: any) {
        console.warn("Error while optimizing image", e.message)
        return new Response("Not Found", { status: 404 })
    }
}