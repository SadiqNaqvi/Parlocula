import { app_production_url } from "@lib/constants";
import { Post } from "@model";
import { MetadataRoute } from "next";
import { connectDatabase } from "@lib/database";
import { PostModelType } from "@type/models";
import { Videos } from "next/dist/lib/metadata/types/metadata-types";
import { GenericDate } from "@type/internal";
import { getVideoThumb } from "@lib/utils/frame";

export const generateSitemaps = async () => {
    await connectDatabase();
    const count = await Post.countDocuments();

    return Array.from(
        { length: Math.ceil(count / 50000) },
        (_, id) => ({ id })
    );
}

const sitemap = async ({ id }: { id: number }): Promise<MetadataRoute.Sitemap> => {
    const posts = await Post.find<PostModelType & { updatedAt: GenericDate }>()
        .skip(id * 50000)
        .limit(50000)
        .select({ _id: 1, updatedAt: 1, frames: 1 })
        .exec();

    return posts.map(post => {
        const images = post.frames?.filter(f => f.type === "image").map(f => f.path);
        return {
            url: `${app_production_url}/p/${post._id}`,
            lastModified: new Date(post.updatedAt).toISOString(),
            changeFrequency: "daily",
            priority: 0.8,
            images,
        }
    });
}

export default sitemap;