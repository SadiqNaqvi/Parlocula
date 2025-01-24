import { convertGenresIntoId } from "@lib/dataRefiner";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const sort = params.get("s") || "popularity";
  const page = params.get("p") || 1;
  const cast = params.get("c");
  const genres = params.get("g");
  const refinedGenres = genres ? convertGenresIntoId(genres, "movie") : null;
  const year = params.get("y");
  const checkYear = () => {
    if (year) {
      const time = new Date(year).getTime();
      if (isNaN(time) || time > new Date().getTime()) {
        console.error("Trying to fetch Movies with Invalid Year");
        return false;
      } else return true;
    } else return false;
  };

  const url = `https://testlalaapp.vercel.app/api/movies?sort=${sort}&p=${page}
        ${cast ? `&c=${cast}` : ""}
        ${refinedGenres ? `&g=${refinedGenres}` : ""}
        ${checkYear() ? `&y=${year}` : ""}`;
  try {
    const data = await (await fetch(url)).text();
    return new Response(data);
  } catch (err: any) {
    console.error("Error occured while fetching movies :" + err.message);
    return new Response(
      JSON.stringify({ status: false, response: err.message })
    );
  }
};
