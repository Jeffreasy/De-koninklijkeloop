const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dgfuv7wif',
    api_key: process.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function checkFolderImages() {
    try {
        console.log("Checking folder: DKLFoto's 2024");
        const result = await cloudinary.api.resources_by_asset_folder("DKLFoto's 2024", {
            max_results: 3
        });

        console.log(`\nFound ${result.resources.length} images:\n`);
        result.resources.forEach((img, i) => {
            console.log(`${i + 1}. Public ID: "${img.public_id}"`);
            console.log(`   Secure URL: ${img.secure_url}\n`);
        });
    } catch (error) {
        console.error('Error:', error.error?.message || error.message);
    }
}

checkFolderImages();
