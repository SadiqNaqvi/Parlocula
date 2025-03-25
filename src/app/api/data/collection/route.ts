import { FullCollectionData } from "@type/types";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");
  if (!id) return;
  try {
    const data: { status: boolean; response: FullCollectionData } = await (
      await fetch(`https://testlalaapp.vercel.app/api/collection?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching collection: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching collection: " + err.message);
    return;
  }
};
