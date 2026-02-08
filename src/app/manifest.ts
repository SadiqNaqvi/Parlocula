import { app_production_url } from "@lib/constants";
import { description, name, title } from "@lib/seo/metadata";
import { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({

    background_color: "#020514",
    description,
    display: "fullscreen",
    icons: [
        { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
    ],
    name: title,
    orientation: "portrait-primary",
    short_name: name,
    start_url: app_production_url,
    theme_color: "#020514"
})

export default manifest;