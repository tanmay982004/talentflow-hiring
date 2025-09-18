// src/api/client.ts

type ClientOptions = {
  body?: any;
  params?: Record<string, any>;
} & Omit<RequestInit, 'body'>; 

export async function client(path: string, options: ClientOptions = {}) {
  const { body, params, method, ...customConfig } = options;

  const url = new URL(`/api/${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Don't add params with empty values, common for filters
      if (value) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  
  console.log('API Request:', {
    path,
    method: method ?? (body ? 'POST' : 'GET'),
    url: url.toString(),
    params,
    body
  });

  const config: RequestInit = {
    method: method ?? (body ? 'POST' : 'GET'), 
    headers: {
      'Content-Type': 'application/json',
      ...customConfig.headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), config);

  // --- THIS IS THE DEFINITIVE FIX ---
  // Before we try to parse the response as JSON, we check the content type.
  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    // For failed responses, we still try to parse JSON for error messages
    const errorData = contentType?.includes('application/json') 
      ? await response.json() 
      : { message: `Request failed with status: ${response.statusText}` };
    throw new Error(errorData.message || 'An API error occurred');
  }

  // If the response is OK but is not JSON (i.e., it's the HTML fallback),
  // we throw a specific, helpful error instead of crashing.
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error("MSW interception failed: Received a non-JSON response. This is a development-only error.");
  }
  // --- END OF FIX ---

  if (response.status === 204) {
    return;
  }
  return response.json();
}