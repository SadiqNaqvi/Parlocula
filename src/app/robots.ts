import { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/settings/",
                "/notifications/",
                "/room/",
                "/join/",
                "/invalidate/",
                "/search",
                "/guest/",
                "/new/",
                "/edit/",
                "/collaborators/",
                "/collaborate/",
                "/invited/",
                "/private/",
                "/shelf/public/",
                "/created/",
                "/joined/",
                "/manages/",
            ],
        },
        sitemap: [
            "https://parlocula.vercel.app/sitemaps/posts/sitemap.xml",
            "https://parlocula.vercel.app/sitemaps/users/sitemap.xml",
            "https://parlocula.vercel.app/sitemaps/shelves/sitemap.xml",
            "https://parlocula.vercel.app/sitemaps/threads/sitemap.xml",
            "https://parlocula.vercel.app/sitemaps/taleons/sitemap.xml",
        ],
    };
}

export default robots;