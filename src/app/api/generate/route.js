import generateAiResponce from "@utils/genAi";
import puppeteer from "puppeteer";

// export async function GET(req) {
//   const params = req.nextUrl.searchParams;

//   const query = `${params.get("q")} (${params.get("y")}) official poster`;
//   const url = `https://www.google.com/search?q=${query}&udm=2`;

//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

//     if (link) return new Response(JSON.stringify({ ok: true, link }));
//     else
//       return new Response(JSON.stringify({ ok: false, msg: "no link found!" }));
//   } catch (err) {
//     console.log(err);
//     return new Response(JSON.stringify({ ok: false, msg: err }));
//   }
//   // };
// }

export async function POST(req) {
  const choice = await req.json();
  const response = await generateAiResponce(choice);
  if (response) return new Response(JSON.stringify({ ok: true, response }));
  else
    return new Response(
      JSON.stringify({ ok: false, response: "nothing can be found" })
    );
}
