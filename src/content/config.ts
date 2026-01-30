import { defineCollection } from "astro:content";
import { cldAssetsLoader } from "astro-cloudinary/loaders";

const dkl25 = defineCollection({
    loader: cldAssetsLoader({
        limit: 100,
        folder: "De Koninklijkeloop/DKLFoto's 2025/DKL25 Foto's 17 mei",
    }),
});

export const collections = {
    dkl25,
};
