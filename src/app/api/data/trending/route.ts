import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const type = params.get("t") || "all";
  const page = params.get("p") || 1;

  const url = `https://testlalaapp.vercel.app/api/trending?t=${type}&p=${page}`;

  try {
    const data = await (await fetch(url)).text();
    return new Response(data);
  } catch (err: any) {
    console.error("Error while fetching movie: " + err.message);
    return new Response(
      JSON.stringify({ status: false, response: err.message })
    );
  }
};
