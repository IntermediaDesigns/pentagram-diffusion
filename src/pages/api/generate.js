import { HfInference } from "@huggingface/inference";
import { createSessionClient } from "../../server/appwrite.js";
import { ID } from "node-appwrite";

const hf = new HfInference(import.meta.env.HUGGINGFACE_API_KEY);

export const prerender = false;

export async function POST({ request, locals }) {
  try {
    const { prompt } = await request.json();

    // Generate image using FLUX.1-dev model
    const imageBytes = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
    });

    // Convert image bytes to buffer
    const buffer = Buffer.from(imageBytes);

    // Get Appwrite client
    const { storage, databases } = createSessionClient(request);

    // Upload image to Appwrite Storage
    const file = await storage.createFile(
      import.meta.env.PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
      ID.unique(),
      buffer,
      "generated-image.jpg"
    );

    // Create document in database
    const document = await databases.createDocument(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
      ID.unique(),
      {
        userId: locals.user.$id,
        prompt,
        imageUrl: storage.getFileView(
          import.meta.env.PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
          file.$id
        ),
        likes: 0,
      }
    );

      return new Response(JSON.stringify({
        success: true,
        imageId: document.$id,
        imageUrl: storage.getFileView(
          import.meta.env.PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
          file.$id
        ),
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
  } catch (error) {
    console.error("Error generating image:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
  }
};
