import { Shelf } from "@model";
import { MetadataRoute } from "next";

export const generateSitemaps = async () => {
    const count = await Shelf.countDocuments();

    return Array.from(
        { length: Math.ceil(count / 50000) },
        (_, id) => ({ id })
    );
}

const sitemap = async ({ id }: { id: number }): Promise<MetadataRoute.Sitemap> => {
    const shelves = await Shelf.find<{ _id: string, updatedAt: number }>()
        .skip(id * 50000)
        .limit(50000)
        .select({ _id: 1, updatedAt: 1 })
        .exec();

    return shelves.map(shelf => ({
        url: `https://parlocula.vercel.app/s/${shelf._id}`,
        lastModified: new Date(shelf.updatedAt),
        changeFrequency: "daily",
        priority: 0.7
    }));
}

export default sitemap;