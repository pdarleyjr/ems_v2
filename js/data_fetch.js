export async function fetchProtocolData() {
  try {
    console.log('Fetching protocol data...');
    const response = await fetch('/js/raw_protocol_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const protocols = await response.json();
    console.log('Raw protocols:', protocols);
    
    // Map protocols to include image paths
    const mappedProtocols = protocols.map(protocol => {
      const mappedProtocol = {
        ...protocol,
        imagePaths: protocol.type === 'medical' || protocol.type === 'trauma' ? 
          protocol.procedureImages.map(pageNum => 
            `/procedures/procedures_Page_${String(pageNum).padStart(2, '0')}.jpg`
          ) : [],
        currentImageIndex: 0 // Track which image is currently displayed for multi-image protocols
      };
      console.log(`Mapped protocol ${protocol.title}:`, mappedProtocol);
      return mappedProtocol;
    });

    return mappedProtocols;
  } catch (error) {
    console.error('Error fetching protocol data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

export function searchProtocols(protocols, keywords) {
  if (!keywords || !protocols) return [];
  
  const searchTerms = keywords.toLowerCase().split(' ');
  return protocols.filter(protocol => {
    const searchText = `${protocol.title} ${protocol.summary} ${protocol.keywords?.join(' ')}`.toLowerCase();
    return searchTerms.every(term => searchText.includes(term));
  });
}

// Helper function to cycle through images for multi-image protocols
export function cycleProtocolImage(protocol) {
  if (!protocol || !protocol.imagePaths || protocol.imagePaths.length <= 1) return protocol;
  
  protocol.currentImageIndex = (protocol.currentImageIndex + 1) % protocol.imagePaths.length;
  return protocol;
}

// Get current image path for a protocol
export function getCurrentImagePath(protocol) {
  if (!protocol || !protocol.imagePaths || protocol.imagePaths.length === 0) return null;
  return protocol.imagePaths[protocol.currentImageIndex];
}