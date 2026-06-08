import { app_production_url } from "@lib/constants";

export default function sitemap() {
  return [
    {
      url: `${app_production_url}/sitemaps/static/sitemap.xml`,
    },
    {
      url: `${app_production_url}/sitemaps/users/sitemap.xml`,
    },
    {
      url: `${app_production_url}/sitemaps/posts/sitemap.xml`,
    },
    {
      url: `${app_production_url}/sitemaps/shelves/sitemap.xml`,
    },
    {
      url: `${app_production_url}/sitemaps/threads/sitemap.xml`,
    },
    {
      url: `${app_production_url}/sitemaps/taleons/sitemap.xml`,
    },
  ];
}