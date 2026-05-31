import { Post } from "@model";
import { MetadataRoute } from "next";

export const generateSitemaps = async () => {
    const count = await Post.countDocuments();

    return Array.from(
        { length: Math.ceil(count / 50000) },
        (_, id) => ({ id })
    );
}

const sitemap = async ({ id }: { id: number }): Promise<MetadataRoute.Sitemap> => {
    const posts = await Post.find<{ _id: string, updatedAt: number }>()
        .skip(id * 50000)
        .limit(50000)
        .select({ _id: 1, updatedAt: 1 })
        .exec();

    return posts.map(post => ({
        url: `https://parlocula.vercel.app/p/${post._id}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "daily",
        priority: 0.8
    }));
}

export default sitemap;