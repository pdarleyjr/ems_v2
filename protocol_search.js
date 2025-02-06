// protocol_search.js

export function findProtocolByComplaint(complaint, protocols) {
    if (!protocols || !complaint) return null;

    const complaintLower = complaint.toLowerCase();
    let matched = null;
    if (Array.isArray(protocols)) {
      matched = protocols.find(proto => {
        return proto.title && proto.title.toLowerCase().includes(complaintLower);
      });
    } else {
      for (let key in protocols) {
        if (key.toLowerCase().includes(complaintLower)) {
          matched = { title: key, content: protocols[key] };
          break;
        }
      }
    }
    return matched;
  }

export function addProtocolSearch(fetchProtocols) {
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search for Protocol';
    searchButton.classList.add('btn');
    searchButton.addEventListener('click', async () => {
        const searchTerm = prompt('Enter search term:');
        if (searchTerm) {
            const protocols = await fetchProtocols();
            const result = findProtocolByComplaint(searchTerm, protocols);
            if (result) {
                alert(`Protocol found: ${result.title}\n\n${result.content}`);
            } else {
                alert('No protocol found.');
            }
        }
    });
    document.body.appendChild(searchButton);
}