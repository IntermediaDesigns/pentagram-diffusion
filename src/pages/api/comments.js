import { createSessionClient } from '../../server/appwrite.js';
import { ID, Query } from 'node-appwrite';

export async function get({ request, url }) {
  try {
    const imageId = url.searchParams.get('imageId');
    if (!imageId) {
      throw new Error('Image ID is required');
    }

    // Get Appwrite client
    const { databases } = createSessionClient(request);

    // Get comments for the image
    const response = await databases.listDocuments(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
      [
        Query.equal('imageId', imageId),
        Query.orderDesc('createdAt'),
      ]
    );

    return new Response(JSON.stringify(response.documents), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
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

export async function post({ request }) {
  try {
    const { imageId, text } = await request.json();
    
    // Get Appwrite client and current user
    const { databases, account } = createSessionClient(request);
    const user = await account.get();

    // Create new comment document
    const comment = await databases.createDocument(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
      ID.unique(),
      {
        imageId,
        userId: user.$id,
        text,
        createdAt: new Date().toISOString()
      }
    );

    return new Response(JSON.stringify({ success: true, comment }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
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

export async function del({ request }) {
  try {
    const { commentId } = await request.json();
    
    // Get Appwrite client
    const { databases } = createSessionClient(request);

    // Delete the comment
    await databases.deleteDocument(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
      commentId
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
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
