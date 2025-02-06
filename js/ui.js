import { fetchProtocols } from './api.js';

const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

searchButton.addEventListener('click', async () => {
  const keywords = searchInput.value;
  const protocols = await fetchProtocols(keywords);
  displayResults(protocols);
});

function displayResults(protocols) {
  resultsDiv.innerHTML = ''; // Clear previous results
  if (protocols) {
    protocols.forEach(protocol => {
      const p = document.createElement('p');
      p.textContent = protocol.name; // Assuming 'name' property exists
      resultsDiv.appendChild(p);
    });
  } else {
    resultsDiv.textContent = 'No results found.';
  }
}

export { displayResults };