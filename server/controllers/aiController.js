import { GoogleGenerativeAI } from '@google/generative-ai';
import Property from '../models/Property.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const GEMINI_PROMPT = (query) => `
You are a property search assistant for a Pakistan rental app called Rentify.
Extract property search filters from the user query below.

Return ONLY valid JSON — no markdown, no explanation, no code blocks.
Use null for any field not mentioned or unclear.

Schema:
{
  "city": string | null,
  "area": string | null,
  "propertyType": "Apartment" | "House" | "Room" | "Shared" | "Private" | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "facilities": string[],
  "responseMessage": string
}

Rules:
- Common cities: Lahore, Karachi, Islamabad, Rawalpindi, Multan, Faisalabad, Peshawar
- "hostel", "dorm", "shared room" → propertyType: "Shared"
- "flat", "apartment" → "Apartment"
- "room", "single room" → "Room"
- "house", "bungalow", "kothi" → "House"
- Prices like "25k", "25,000" → 25000; "1 lakh" → 100000
- Facilities from: WiFi, AC, Parking, Kitchen, Laundry, Security, Furnished, Electricity Backup, Balcony
- responseMessage: a friendly, natural 1-sentence reply confirming what you searched for

User query: "${query.replace(/"/g, "'")}"
`;

export const recommend = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required.',
      });
    }

    let filters = {};
    let responseMessage = `Here are properties matching "${query}".`;

    // ── Step 1: Gemini extracts structured filters ────────────────────────────
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(GEMINI_PROMPT(query));
      const raw = result.response.text().trim();

      // Strip markdown fences if Gemini added them anyway
      const jsonStr = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(jsonStr);
      filters = parsed;
      responseMessage = parsed.responseMessage || responseMessage;
    } catch (geminiErr) {
      console.warn('[AI] Gemini parse failed, using plain text search:', geminiErr.message);
      // Fall back to text search on query string
    }

    // ── Step 2: Build MongoDB filter ─────────────────────────────────────────
    const dbFilter = {
      status: 'APPROVED',
      isAvailable: true,
      isDeleted: { $ne: true },
    };

    if (filters.city) {
      dbFilter.city = { $regex: filters.city.trim(), $options: 'i' };
    }
    if (filters.area) {
      dbFilter.area = { $regex: filters.area.trim(), $options: 'i' };
    }
    if (filters.propertyType) {
      dbFilter.propertyType = filters.propertyType;
    }

    const priceFilter = {};
    if (typeof filters.minPrice === 'number') priceFilter.$gte = filters.minPrice;
    if (typeof filters.maxPrice === 'number') priceFilter.$lte = filters.maxPrice;
    if (Object.keys(priceFilter).length) dbFilter.price = priceFilter;

    if (Array.isArray(filters.facilities) && filters.facilities.length) {
      dbFilter.facilities = { $in: filters.facilities };
    }

    // If Gemini gave no structured filters, fall back to a broad text search
    const hasFilters = Object.keys(dbFilter).length > 3;
    if (!hasFilters) {
      dbFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { area: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // ── Step 3: Query MongoDB ─────────────────────────────────────────────────
    const properties = await Property.find(dbFilter)
      .select('_id title city area price propertyType images facilities availableRooms isAvailable')
      .sort({ views: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      message: responseMessage,
      properties,
    });
  } catch (err) {
    next(err);
  }
};
