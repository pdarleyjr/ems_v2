import { PROTOCOL_MAPPING } from './protocol_mapping.js';

const PANTRY_ID = '06228d62-f775-4ce4-b705-de0e7a85ec43';
const PROXY_URL = 'http://localhost:3001/api';

async function fetchFromPantry(basketName) {
  try {
    // Try proxy first
    const proxyResponse = await fetch(`${PROXY_URL}/basket/${basketName}`);
    if (proxyResponse.ok) {
      return await proxyResponse.json();
    }

    // Fallback to direct Pantry API if proxy fails
    const url = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${basketName}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Pantry:', error);
    return null;
  }
}

async function fetchProtocols(keywords) {
  try {
    // Fetch all protocols from their individual baskets
    const protocols = [];
    for (const [protocolName, basketName] of Object.entries(PROTOCOL_MAPPING)) {
      const data = await fetchFromPantry(basketName);
      if (data) {
        protocols.push({
          title: protocolName,
          name: protocolName,
          content: data.full_content || '',
          keywords: data.keywords || [],
          summary: data.summary || '',
          type: data.type || ''
        });
      }
    }

    // If keywords provided, filter protocols
    if (keywords && keywords.trim()) {
      const searchTerm = keywords.toLowerCase();
      return protocols.filter(protocol => {
        return protocol.title.toLowerCase().includes(searchTerm) ||
               protocol.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
               protocol.summary.toLowerCase().includes(searchTerm);
      });
    }

    return protocols;
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return null;
  }
}

export { fetchProtocols };