import { app_production_url } from "@lib/constants";
import { connectDatabase } from "@lib/database";
import { Post, Shelf, Taleon, Thread, User } from "@model";
import { StrictModel } from "@type/mongoose";

const getUrlsForSitemap = async (collection: "users" | "posts" | "shelves" | "threads" | "taleons"): Promise<{ url: string }[]> => {

  let Model: StrictModel<any>;
  if (collection === "posts")
    Model = Post;
  else if (collection === "shelves")
    Model = Shelf;
  else if (collection === "taleons")
    Model = Taleon;
  else if (collection === "threads")
    Model = Thread;
  else if (collection === "users")
    Model = User;
  else throw new Error(`Invalid Collection, got: ${collection}`);

  const count = await Model.countDocuments();

  return Array.from(
    { length: Math.ceil(count / 50000) },
    (_, id) => ({
      url: `${app_production_url}/sitemaps/${collection}/sitemap/${id}.xml`
    })
  );
}

const sitemap = async () => {

  await connectDatabase();

  const userSitemaps = await getUrlsForSitemap("users");
  const postsSitemaps = await getUrlsForSitemap("posts");
  const shelvesSitemaps = await getUrlsForSitemap("shelves");
  const threadsSitemaps = await getUrlsForSitemap("threads");
  const taleonsSitemaps = await getUrlsForSitemap("taleons");

  return [
    {
      url: `${app_production_url}/sitemaps/static/sitemap.xml`,
    },
    ...userSitemaps,
    ...postsSitemaps,
    ...shelvesSitemaps,
    ...threadsSitemaps,
    ...taleonsSitemaps,
  ];
}

export default sitemap;