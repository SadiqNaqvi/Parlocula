import { app_production_url } from "@lib/constants";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: app_production_url,
            priority: 1,
            lastModified: new Date().toISOString(),
            changeFrequency: "always",
        },
        {
            url: `${app_production_url}/join`,
            priority: 0.9,
            lastModified: new Date().toISOString(),
        },
        {
            url: `${app_production_url}/thread`,
            priority: 0.8,
            changeFrequency:"daily",
        },
        {
            url: `${app_production_url}/shelf`,
            priority: 0.8,
            changeFrequency:"daily",
        },
        {
            url: `${app_production_url}/app/about`,
            priority: 0.7,
        },
        {
            url: `${app_production_url}/app/privacy_policy`,
            priority: 0.5,
        },
        {
            url: `${app_production_url}/app/terms_and_conditions`,
            priority: 0.5,
        },
    ];
}