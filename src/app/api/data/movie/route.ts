import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  if (!id)
    return new Response(
      JSON.stringify({ status: false, response: "Invalid Movie id" })
    );

  const url = `https://testlalaapp.vercel.app/api/movie?id=${id}`;

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
