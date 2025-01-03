// src/middleware.js

import { defineMiddleware } from "astro:middleware";
import { createSessionClient } from "./server/appwrite";

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  // Initialize authentication status
  locals.isAuthenticated = false;
  locals.user = null;

  try {
    const { account } = createSessionClient(request);
    const user = await account.get();
    locals.isAuthenticated = true;
    locals.user = user;
  } catch (error) {
    // Only require authentication for specific API routes
    const authRequiredRoutes = ['/api/generate'];
    const url = new URL(request.url);
    if (authRequiredRoutes.includes(url.pathname) && request.method !== 'OPTIONS') {
      return new Response(JSON.stringify({
        success: false,
        error: "Authentication required"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }

  return next();
});
