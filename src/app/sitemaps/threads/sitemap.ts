import { Thread } from "@model";
import { MetadataRoute } from "next";

export const generateSitemaps = async () => {
    const count = await Thread.countDocuments();

    return Array.from(
        { length: Math.ceil(count / 50000) },
        (_, id) => ({ id })
    );
}

const sitemap = async ({ id }: { id: number }): Promise<MetadataRoute.Sitemap> => {
    const threads = await Thread.find<{ _id: string, updatedAt: number }>()
        .skip(id * 50000)
        .limit(50000)
        .select({ _id: 1, updatedAt: 1 })
        .exec();

    return threads.map(thread => ({
        url: `https://parlocula.vercel.app/t/${thread._id}`,
        lastModified: new Date(thread.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7
    }));
}

export default sitemap;