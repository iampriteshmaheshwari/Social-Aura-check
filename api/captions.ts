import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mime type" });
    }

    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ error: "Invalid mime type. Must be an image." });
    }

    // Limit payload size to ~4.5MB (Vercel Serverless limit)
    // 4.5MB in base64 is roughly 6,000,000 characters
    if (imageBase64.length > 6000000) {
      return res.status(413).json({ error: "Image payload too large." });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const systemInstruction = `
You are an expert social media strategist and philosopher who deeply understands the Gen Z market, internet culture, aesthetics, and modern linguistic trends. 
The user will provide a photo. Your task is to analyze the photo carefully and generate exactly 5 distinct, premium, and minimalistic captions suitable for social media (like Instagram or TikTok).

Constraints:
1. Do not act overly corporate. Keep it effortlessly cool, slightly philosophical, witty, or culturally resonant for GenZ.
2. IMPORTANT: If there are people in the photo, DO NOT assume their relationship. Do NOT automatically assume they are a couple. They could be siblings, friends, parent-child, etc. Keep language slightly ambiguous but warm/cool (e.g., using "my people", "energy", "duo", "trio", "chosen family", etc. instead of "my love", "bae", unless the context is overwhelmingly unambiguous, but still prefer neutral descriptors).
3. Provide the captions in a clean JSON format.

JSON Schema format: 
{ "captions": ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"] }
`;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let responseText = "{}";
    let lastError: any = null;
    let mostSignificantError: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: "Please generate 5 captions for this photo." }, imagePart] },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        responseText = response.text || "{}";
        lastError = null;
        break;
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next... Error:`, err?.message || err);
        lastError = err;
        
        // Prioritize capturing rate limits or 503s over 404s
        if (err?.status === 429 || err?.status === 503 || err?.message?.includes("Quota")) {
           mostSignificantError = err;
        }
      }
    }

    if (lastError) {
      throw mostSignificantError || lastError; // Throw the most relevant error if all models failed
    }

    const captionsData = JSON.parse(responseText);

    res.status(200).json(captionsData);
  } catch (error: any) {
    console.error("Error generating captions:", error);
    const isUnavailable = error?.status === 503 || error?.message?.includes("experiencing high demand");
    const isRateLimited = error?.status === 429 || error?.message?.includes("Quota exceeded") || error?.message?.includes("Too Many Requests");
    
    let errorMessage = "Failed to generate captions. Please try again.";
    let statusCode = 500;
    
    if (isUnavailable) {
      errorMessage = "Google AI system is currently experiencing high demand. Please try again in a few moments.";
      statusCode = 503;
    } else if (isRateLimited) {
      errorMessage = "Rate limit or quota exceeded. Please wait a moment and try again.";
      statusCode = 429;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
}

