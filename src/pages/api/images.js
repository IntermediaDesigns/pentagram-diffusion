import { createSessionClient } from "../../server/appwrite.js";
import { Query } from "node-appwrite";

export const GET = async ({ request }) => {
  try {
    // Get Appwrite client
    const { databases } = createSessionClient(request);

    // Get images from database
    const response = await databases.listDocuments(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    return new Response(JSON.stringify(response.documents), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export const POST = async ({ request }) => {
  try {
    const { imageId, action } = await request.json();

    // Get Appwrite client
    const { databases } = createSessionClient(request);

    if (action === "like") {
      // First get the current document to get the current likes count
      const doc = await databases.getDocument(
        import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
        import.meta.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
        imageId
      );

      // Update with incremented likes
      await databases.updateDocument(
        import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
        import.meta.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
        imageId,
        {
          likes: (doc.likes || 0) + 1,
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
