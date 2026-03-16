import { NextRequest } from "next/server";

export const GET = async (r: NextRequest, { params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params;

    try {
        const resp = await fetch(`https://vimeo.com/api/v2/video/${id}.json`);
        if (!resp.ok) return new Response("Not Found", { status: 404 });

        const res: [{ thumbnail_large: string }] = await resp.json();

        return await fetch(res[0]?.thumbnail_large);

    } catch (e: any) {
        console.log("Error occured while getting vimeo thumb", e);
        return new Response(e.message, { status: 500 });
    }

}