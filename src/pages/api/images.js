import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

export async function get({ request }) {
  try {
    // Get images from Appwrite database
    const response = await databases.listDocuments(
      process.env.PUBLIC_APPWRITE_DATABASE_ID,
      process.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(20)
      ]
    );

    // Transform the data to include necessary fields
    const images = response.documents.map(doc => ({
      id: doc.$id,
      url: doc.imageUrl,
      prompt: doc.prompt,
      createdAt: doc.$createdAt,
      likes: doc.likes || 0,
      comments: doc.comments || [],
      userId: doc.userId,
    }));

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle likes
export async function post({ request }) {
  try {
    const { imageId, action } = await request.json();
    
    if (action === 'like') {
      await databases.updateDocument(
        process.env.PUBLIC_APPWRITE_DATABASE_ID,
        process.env.PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
        imageId,
        {
          likes: Query.increment(1)
        }
      );
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
