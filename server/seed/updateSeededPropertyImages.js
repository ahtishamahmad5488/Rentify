/**
 * Rentify — Update Seeded Property Images
 *
 * Replaces generic picsum images with category-appropriate images
 * organised by propertyType (Apartment / House / Room / Shared / Private).
 *
 * Only touches properties owned by seeded landlords (@seedrpk.pk emails).
 * Never deletes properties or changes any other field.
 *
 * Usage:
 *   node seed/updateSeededPropertyImages.js
 *   DRY_RUN=true node seed/updateSeededPropertyImages.js   ← preview only
 */

import "dotenv/config";
import connectDB from "../config/database.js";
import Landlord from "../models/Landlord.js";
import Property from "../models/Property.js";

const SEED_TAG = "@seedrpk.pk";
const DRY_RUN = process.env.DRY_RUN === "true";

// ─── Category-specific image pools ────────────────────────────────────────────
// Each entry: { public_id, secure_url } matching the PropertyImage schema.
// Images are stable picsum URLs grouped by visual category.

const POOLS = {
  Apartment: [
    {
      id: "apartment/1",
      url: "https://pixabay.com/images/download/jeanvdmeulen-dining-room-3108037_1280.jpg",
    },
    {
      id: "apartment/2",
      url: "https://images.pexels.com/photos/17924970/pexels-photo-17924970.jpeg",
    },
    {
      id: "apartment/3",
      url: "https://pixabay.com/images/download/clickerhappy-living-room-2732939_1920.jpg",
    },
    {
      id: "apartment/4",
      url: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
    },
    {
      id: "apartment/5",
      url: "https://images.pexels.com/photos/37253217/pexels-photo-37253217.jpeg",
    },
    {
      id: "apartment/6",
      url: "https://images.pexels.com/photos/33320790/pexels-photo-33320790.jpeg",
    },
    {
      id: "apartment/7",
      url: "https://pixabay.com/images/download/jeanvdmeulen-dining-room-3108037_1280.jpg",
    },
  ],
  House: [
    {
      id: "house/1",
      url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6OTA2OTM2NzAxODIxMjgwMjA3/original/5892c016-09e1-454a-b390-329d3590bdd6.jpeg?im_w=720",
    },
    {
      id: "house/2",
      url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6Mjg3NDUzNDA%3D/original/89f39025-438a-437a-a839-556c1a6c90af.jpeg",
    },
    {
      id: "house/3",
      url: "https://img.freepik.com/free-photo/3d-rendering-luxury-modern-living-room-with-leather-sofa-lamp_105762-2255.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: "house/4",
      url: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/06/Types-of-Apartments-in-Pakistan-B-24-06-1024x640.jpg",
    },
    {
      id: "house/5",
      url: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/06/Types-of-Apartments-in-Pakistan-B-24-06-1024x640.jpg",
    },
    {
      id: "house/6",
      url: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/06/Types-of-Apartments-in-Pakistan-B-24-06-1024x640.jpg",
    },
    {
      id: "house/7",
      url: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/06/Types-of-Apartments-in-Pakistan-B-24-06-1024x640.jpg",
    },
  ],
  Room: [
    {
      id: "room/1",
      url: "https://images.olx.com.pk/thumbnails/610939779-400x300.jpeg",
    },
    {
      id: "room/2",
      url: "https://lid.zoocdn.com/645/430/76e9c631dde3b77934f179be65299b43ee8f0f86.jpg",
    },
    {
      id: "room/3",
      url: "https://images.olx.com.pk/thumbnails/615555109-400x300.jpeg",
    },
    {
      id: "room/4",
      url: "https://a0.muscache.com/im/pictures/4ac2fa8a-7fe5-47e5-beb3-3df2823f2734.jpg",
    },
    {
      id: "room/5",
      url: "https://img.magnific.com/free-photo/dining-area-comfortable-studio-flat-hotel-room_1262-12324.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: "room/6",
      url: "https://images.olx.com.pk/thumbnails/610939779-400x300.jpeg",
    },
  ],
  Shared: [
    {
      id: "shared/1",
      url: "https://img.magnific.com/free-photo/cozy-living-room-interior-with-panoramic-window_1262-12322.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: "shared/2",
      url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1517424985259150923/original/d4b99e17-f56e-4f09-ba39-e9e650350053.jpeg?im_w=720",
    },
    {
      id: "shared/3",
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: "shared/4",
      url: "https://static.vecteezy.com/system/resources/thumbnails/069/792/007/small/modern-city-apartment-bedroom-workspace-large-window-urban-view-student-housing-photo.jpg",
    },
    {
      id: "shared/5",
      url: "https://images.olx.com.pk/thumbnails/613797365-400x300.jpeg",
    },
    {
      id: "shared/6",
      url: "https://images.olx.com.pk/thumbnails/610939779-400x300.jpeg",
    },
  ],
  Private: [
    {
      id: "private/1",
      url: "https://images.olx.com.pk/thumbnails/615555109-400x300.jpeg",
    },
    {
      id: "private/2",
      url: "https://lid.zoocdn.com/645/430/76e9c631dde3b77934f179be65299b43ee8f0f86.jpg  ",
    },
    {
      id: "private/3",
      url: "https://img.magnific.com/free-photo/dining-area-comfortable-studio-flat-hotel-room_1262-12324.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: "private/4",
      url: "https://static.vecteezy.com/system/resources/thumbnails/069/792/007/small/modern-city-apartment-bedroom-workspace-large-window-urban-view-student-housing-photo.jpg",
    },
    {
      id: "private/5",
      url: "https://images.olx.com.pk/thumbnails/610939779-400x300.jpeg",
    },
  ],
};

// Fallback pool used when propertyType doesn't match a known key
const DEFAULT_POOL = POOLS.Apartment;

/**
 * Pick `count` images from a pool, cycling by a numeric offset derived
 * from the property's MongoDB ObjectId (deterministic, no randomness).
 */
function pickImages(pool, propertyId, count = 4) {
  // Use last 4 hex chars of ObjectId as a numeric offset so each property
  // gets a consistent but varied set of images.
  const offset = parseInt(String(propertyId).slice(-4), 16) % pool.length;
  return Array.from({ length: count }, (_, i) => {
    const item = pool[(offset + i) % pool.length];
    return {
      public_id: `rentify/seed/${item.id}_${i}`,
      secure_url: item.url,
    };
  });
}

async function run() {
  await connectDB();
  console.log(`\n[updateSeededImages] DRY_RUN=${DRY_RUN}`);

  // 1. Find seeded landlords
  const landlords = await Landlord.find({
    email: { $regex: `${SEED_TAG.replace(".", "\\.")}$` },
  }).select("_id email");

  if (!landlords.length) {
    console.log("No seeded landlords found. Run seed:properties first.");
    process.exit(0);
  }
  console.log(`Found ${landlords.length} seeded landlords.`);

  const ownerIds = landlords.map((l) => l._id);

  // 2. Find their properties
  const properties = await Property.find({ owner: { $in: ownerIds } }).select(
    "_id propertyType title",
  );
  console.log(`Found ${properties.length} seeded properties to update.\n`);

  let updated = 0;
  let skipped = 0;

  for (const prop of properties) {
    const pool = POOLS[prop.propertyType] || DEFAULT_POOL;
    const images = pickImages(pool, prop._id, 4);

    if (DRY_RUN) {
      console.log(
        `[DRY] ${prop.propertyType.padEnd(10)} "${prop.title}" → ${images[0].secure_url}`,
      );
      skipped++;
      continue;
    }

    await Property.updateOne({ _id: prop._id }, { $set: { images } });
    console.log(`✓ Updated ${prop.propertyType.padEnd(10)} "${prop.title}"`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Dry-run skipped: ${skipped}`);
  process.exit(0);
}

run().catch((err) => {
  console.error("[updateSeededImages] Fatal error:", err);
  process.exit(1);
});
