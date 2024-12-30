import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function post({ request }) {
  try {
    const { prompt } = await request.json();
    
    // Generate image using FLUX.1-dev model
    const response = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-dev',
      inputs: prompt,
    });

    // Convert blob to base64
    const imageBlob = await response.blob();
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = buffer.toString('base64');

    // Store image in Appwrite
    // Add your Appwrite storage logic here

    return new Response(JSON.stringify({
      success: true,
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
    }), {
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