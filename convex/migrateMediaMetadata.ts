import { internalMutation } from "./_generated/server";

/**
 * Migration Script: Rename public_id to cloudinary_public_id
 * 
 * This script migrates existing media_metadata records from the old schema
 * (with public_id) to the new schema (with cloudinary_public_id).
 * 
 * Run with: npx convex run migrateMediaMetadata:migrate
 */
export const migrate = internalMutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting media_metadata migration...");

        // Get all media_metadata records
        const allRecords = await ctx.db.query("media_metadata").collect();

        console.log(`Found ${allRecords.length} media_metadata records`);

        let migrated = 0;
        let skipped = 0;

        for (const record of allRecords) {
            const recordData = record as any;

            // Check if record has old public_id field
            if (recordData.public_id && !recordData.cloudinary_public_id) {
                // Delete the old record
                await ctx.db.delete(record._id);

                // Create new record with cloudinary_public_id
                await ctx.db.insert("media_metadata", {
                    cloudinary_public_id: recordData.public_id,
                    alt_text: recordData.alt_text,
                    title: recordData.title,
                    folder: recordData.folder,
                    tags: recordData.tags,
                    updated_by: recordData.updated_by,
                    updated_at: recordData.updated_at || Date.now(),
                });

                migrated++;
                console.log(`Migrated: ${recordData.public_id}`);
            } else if (recordData.cloudinary_public_id) {
                // Already migrated
                skipped++;
            } else {
                console.warn(`Record ${record._id} has neither public_id nor cloudinary_public_id`);
            }
        }

        console.log(`Migration complete! Migrated: ${migrated}, Skipped: ${skipped}`);

        return {
            success: true,
            total: allRecords.length,
            migrated,
            skipped
        };
    },
});
