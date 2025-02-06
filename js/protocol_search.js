import { fetchProtocolData, searchProtocols } from './data_fetch.js';

let protocols = [];
let searchContainer = null;
let resultsDiv = null;

// Initialize protocol search functionality
async function initializeProtocolSearch() {
  console.log('Initializing protocol search...');
  
  // Initialize protocol images
  console.log('Initializing protocol images...');
  await initializeImages();
  console.log('Protocol images initialized');

  // Create search container
  console.log('Creating search container...');
  createSearchContainer();

  // Load initial protocols
  console.log('Loading protocols...');
  protocols = await fetchProtocolData();
  console.log(`Loaded ${protocols.length} protocols`);

  // Add search container to DOM
  document.body.appendChild(searchContainer);
  console.log('Search container added to DOM');

  console.log('Protocol search initialization complete');
}

// Create search interface container
function createSearchContainer() {
  searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';

  // Create protocol select dropdown
  const selectContainer = document.createElement('div');
  selectContainer.className = 'select-container';
  
  const protocolSelect = document.createElement('select');
  protocolSelect.id = 'protocolSelect';
  protocolSelect.innerHTML = '<option value="">Select Protocol...</option>';
  
  const selectLabel = document.createElement('label');
  selectLabel.htmlFor = 'protocolSelect';
  selectLabel.textContent = 'Protocol:';
  
  selectContainer.appendChild(selectLabel);
  selectContainer.appendChild(protocolSelect);

  // Create search box
  const searchBox = document.createElement('div');
  searchBox.className = 'search-box';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'searchInput';
  searchInput.placeholder = 'Search protocols...';
  
  const searchButton = document.createElement('button');
  searchButton.id = 'searchButton';
  searchButton.textContent = 'Search';

  searchBox.appendChild(searchInput);
  searchBox.appendChild(searchButton);

  // Create results container
  resultsDiv = document.createElement('div');
  resultsDiv.id = 'results';

  // Add all elements to search container
  searchContainer.appendChild(selectContainer);
  searchContainer.appendChild(searchBox);
  searchContainer.appendChild(resultsDiv);

  // Add event listeners
  protocolSelect.addEventListener('change', handleProtocolSelect);
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

// Handle protocol selection
async function handleProtocolSelect() {
  const select = document.getElementById('protocolSelect');
  const selectedProtocol = select.value;
  
  if (selectedProtocol) {
    const filteredProtocols = await fetchProtocolData(selectedProtocol);
    displayResults(filteredProtocols);
  } else {
    resultsDiv.innerHTML = '';
  }
}

// Handle search
async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm) {
    const searchResults = searchProtocols(protocols, searchTerm);
    displayResults(searchResults);
  } else {
    displayResults(protocols);
  }
}

// Display search results
function displayResults(results) {
  if (!resultsDiv) return;
  
  resultsDiv.innerHTML = '';
  
  if (!results || results.length === 0) {
    resultsDiv.textContent = 'No results found.';
    return;
  }

  results.forEach(protocol => {
    const protocolCard = document.createElement('div');
    protocolCard.className = 'protocol-card';

    // Title
    const title = document.createElement('h3');
    title.className = 'protocol-title';
    title.textContent = protocol.title;
    protocolCard.appendChild(title);

    // Type badge if available
    if (protocol.type) {
      const typeBadge = document.createElement('span');
      typeBadge.className = `protocol-type ${protocol.type.toLowerCase()}`;
      typeBadge.textContent = protocol.type;
      protocolCard.appendChild(typeBadge);
    }

    // Summary if available
    if (protocol.summary) {
      const summary = document.createElement('p');
      summary.className = 'protocol-summary';
      summary.textContent = protocol.summary;
      protocolCard.appendChild(summary);
    }

    // Keywords if available
    if (protocol.keywords && protocol.keywords.length > 0) {
      const keywordsContainer = document.createElement('div');
      keywordsContainer.className = 'protocol-keywords';
      protocol.keywords.forEach(keyword => {
        const keywordTag = document.createElement('span');
        keywordTag.className = 'keyword-tag';
        keywordTag.textContent = keyword;
        keywordsContainer.appendChild(keywordTag);
      });
      protocolCard.appendChild(keywordsContainer);
    }

    // Add click handler to expand/collapse
    protocolCard.addEventListener('click', () => {
      protocolCard.classList.toggle('expanded');
    });

    resultsDiv.appendChild(protocolCard);
  });
}

// Initialize protocol images
async function initializeImages() {
  // This function can be implemented if needed
  return Promise.resolve();
}

// Export functions
export { initializeProtocolSearch };