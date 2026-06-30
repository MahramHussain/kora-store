import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://korastore.ae";

  // Static routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/shipping`, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
  ];

  // Dynamic product routes
  try {
    const products = await prisma.product.findMany({
      select: { id: true, createdAt: true }
    });

    const productRoutes = products.map(product => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    return staticRoutes;
  }
}
