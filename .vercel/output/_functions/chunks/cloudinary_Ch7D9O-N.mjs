import { v2 } from 'cloudinary';

const videos = [
  {
    shortcode: "xabadh",
    title: "Aftermovie 2025",
    year: "2025",
    featured: true
  },
  {
    shortcode: "tt6k80",
    title: "Sfeerimpressie Start",
    year: "2025"
  },
  {
    shortcode: "tt6k80",
    title: "Aftermovie 2024",
    year: "2024",
    featured: true
  },
  {
    shortcode: "opjpma",
    title: "De Route",
    // Placeholder
    year: "2024"
  },
  {
    shortcode: "cvfrpi",
    title: "Feestelijke Finish",
    // Placeholder
    year: "2023"
  },
  {
    shortcode: "0o2qf9",
    title: "Vrijwilligers Bedankt",
    // Placeholder
    year: "2023"
  }
];

v2.config({
  cloud_name: "dgfuv7wif",
  api_key: "284312759568494",
  api_secret: "F3oqzCUibbxtLulrpwT5HyiQrDk"
});
const CACHE_TTL = 1e3 * 60 * 60;
const cache = /* @__PURE__ */ new Map();
async function getImagesFromFolder(folderName, year) {
  const now = Date.now();
  const cacheKey = `${folderName}-${year}`;
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache] Serving images for ${folderName} from memory`);
    return cached.data;
  }
  try {
    console.log(`[Cloudinary] Fetching images for ${folderName}`);
    const result = await v2.api.resources_by_asset_folder(folderName, {
      max_results: 500,
      context: true,
      tags: true
    });
    if (!result.resources || result.resources.length < 1) {
      return [];
    }
    const processedImages = result.resources.map((res) => ({
      src: res.public_id,
      alt: res.context?.custom?.alt || `Foto uit ${year}`,
      aspect: res.width && res.height && res.width > res.height ? "horizontal" : "vertical",
      year
    }));
    cache.set(cacheKey, { data: processedImages, timestamp: now });
    return processedImages;
  } catch (e) {
    const error = e;
    console.error(`[Cloudinary] Error fetching images for "${folderName}":`, error.error?.message || String(e));
    if (cached) {
      console.warn(`[Cache] Serving STALE images for ${folderName} due to API error`);
      return cached.data;
    }
    return [];
  }
}

export { getImagesFromFolder as g, videos as v };
