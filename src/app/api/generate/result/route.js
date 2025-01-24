import connectDb from "@/utils/database";
import { Movie } from "@/model/movies.model.js";
import axios from "axios";

const fetchFromDB = async (name, year) => {
  try {
    await connectDb();
    const movie = await Movie.findOne({ title: name, release_year: year });
    console.log(movie);
    return movie;
  } catch (err) {
    console.log("Failed fetching form db", err);
  }
};

export const POST = async (req) => {
  const data = await req.json();
  try {
    await connectDb();
    await Movie.create(data);
    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Failed adding movie to the database:", err.errmsg);
    return new Response(JSON.stringify({ ok: false }));
  }
};

export const GET = async (req) => {
  const params = req.nextUrl.searchParams;

  try {
    const resp = await fetchFromDB(params.get("q"), params.get("y"));
    if (resp)
      return new Response(
        JSON.stringify({ ok: true, response: resp, byDb: true })
      );

    const res = await axios.get(
      `http://www.omdbapi.com/?apikey=${process.env.OMDB_API}&t=${params.get(
        "q"
      )}&y=${params.get("y")}&plot=full`
    );
    return new Response(
      JSON.stringify({ ok: true, response: res.data, byDb: false })
    );
  } catch (err) {
    console.log("Failed fetching movie: ", err);
    return new Response(JSON.stringify({ ok: false }));
  }
};
