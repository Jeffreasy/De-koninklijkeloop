require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgfuv7wif',
    api_key: process.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkFolderImages() {
    const folderName = "De Koninklijkeloop/DKLFoto's 2024";

    try {
        console.log(`Checking folder: ${folderName}\n`);
        const result = await cloudinary.api.resources_by_asset_folder(folderName, {
            max_results: 2
        });

        console.log(`✅ Found ${result.resources.length} images:\n`);
        result.resources.forEach((img, i) => {
            console.log(`${i + 1}. PUBLIC_ID="${img.public_id}"`);
            console.log(`   Asset Folder="${img.asset_folder}"`);
            console.log(`   Folder="${img.folder}"`);
            console.log(`   Display Name="${img.display_name}"`);
            console.log(`   Format=${img.format}`);
            console.log(`   Secure URL=${img.secure_url}\n`);
        });
    } catch (error) {
        console.error('❌ Error:', error.error?.message || error.message);
    }
}

checkFolderImages();
