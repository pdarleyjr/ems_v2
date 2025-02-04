import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

async function fetchProtocols(keywords) {
  try {
    const response = await fetch(`https://pantry-api.com/protocols?keywords=${keywords}`, {
      headers: {
        'Authorization': `Bearer ${config.pantryApiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return null;
  }
}

export { fetchProtocols };