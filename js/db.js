// IndexedDB operations for abbreviations and procedure images storage
const DB_NAME = 'emsDB';
const DB_VERSION = 2;
const ABBR_STORE_NAME = 'abbreviations';
const IMG_STORE_NAME = 'procedureImages';

// Initialize the database
export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject('Database error: ' + event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const oldVersion = event.oldVersion;

            // Create abbreviations store if it doesn't exist
            if (!db.objectStoreNames.contains(ABBR_STORE_NAME)) {
                db.createObjectStore(ABBR_STORE_NAME, { keyPath: 'abbreviation' });
            }

            // Create procedure images store if upgrading from version 1
            if (oldVersion < 2 && !db.objectStoreNames.contains(IMG_STORE_NAME)) {
                const imgStore = db.createObjectStore(IMG_STORE_NAME, { keyPath: ['protocolId', 'pageNumber'] });
                imgStore.createIndex('protocolId', 'protocolId', { unique: false });
                imgStore.createIndex('pageNumber', 'pageNumber', { unique: false });
            }
        };
    });
}

// Store abbreviations in the database
export function storeAbbreviations(abbreviations) {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction([ABBR_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(ABBR_STORE_NAME);

            // Clear existing data
            store.clear();

            // Add all abbreviations
            abbreviations.forEach(abbr => {
                store.add(abbr);
            });

            transaction.oncomplete = () => {
                resolve('Abbreviations stored successfully');
            };

            transaction.onerror = (event) => {
                reject('Error storing abbreviations: ' + event.target.error);
            };
        }).catch(reject);
    });
}

// Get all abbreviations from the database
export function getAllAbbreviations() {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction([ABBR_STORE_NAME], 'readonly');
            const store = transaction.objectStore(ABBR_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject('Error retrieving abbreviations: ' + event.target.error);
            };
        }).catch(reject);
    });
}

// Search for abbreviations by prefix
export function searchAbbreviations(prefix) {
    return new Promise((resolve, reject) => {
        getAllAbbreviations().then(abbreviations => {
            const results = abbreviations.filter(abbr => 
                abbr.abbreviation.toLowerCase().startsWith(prefix.toLowerCase())
            );
            resolve(results);
        }).catch(reject);
    });
}

// Store a protocol image in the database
export function storeProtocolImage(protocolId, imageData, pageNumber, description = '') {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction([IMG_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(IMG_STORE_NAME);

            const image = {
                protocolId,
                pageNumber,
                imageData,
                description,
                timestamp: new Date().toISOString()
            };

            const request = store.put(image);

            request.onsuccess = () => {
                console.log(`Stored image for ${protocolId}, page ${pageNumber}`);
                resolve('Image stored successfully');
            };

            request.onerror = (event) => {
                console.error(`Error storing image for ${protocolId}:`, event.target.error);
                reject('Error storing image: ' + event.target.error);
            };
        }).catch(reject);
    });
}

// Get all images for a specific protocol
export function getProtocolImages(protocolId) {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction([IMG_STORE_NAME], 'readonly');
            const store = transaction.objectStore(IMG_STORE_NAME);
            const index = store.index('protocolId');
            const request = index.getAll(protocolId);

            request.onsuccess = () => {
                const images = request.result.sort((a, b) => a.pageNumber - b.pageNumber);
                console.log(`Retrieved ${images.length} images for ${protocolId}`);
                resolve(images);
            };

            request.onerror = (event) => {
                console.error(`Error retrieving images for ${protocolId}:`, event.target.error);
                reject('Error retrieving protocol images: ' + event.target.error);
            };
        }).catch(reject);
    });
}

// Get all protocol images
export function getAllProtocolImages() {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const transaction = db.transaction([IMG_STORE_NAME], 'readonly');
            const store = transaction.objectStore(IMG_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject('Error retrieving all images: ' + event.target.error);
            };
        }).catch(reject);
    });
}

// Initialize database with abbreviations data
export function initializeAbbreviationsDB() {
    const abbreviations = [
        { abbreviation: 'aa', meaning: 'before' },
        { abbreviation: 'ABC', meaning: 'airway, breathing, circulation' },
        { abbreviation: 'abd', meaning: 'abdomen' },
        { abbreviation: 'A/C', meaning: 'antecubital fossa' },
        { abbreviation: 'ACLS', meaning: 'advanced cardiac life support' },
        { abbreviation: 'ACS', meaning: 'Acute Coronary Syndrome' },
        { abbreviation: 'A.D.', meaning: 'right ear' },
        { abbreviation: 'A.S.', meaning: 'left ear' },
        { abbreviation: 'A.U.', meaning: 'both ears' },
        { abbreviation: 'AIDS', meaning: 'acquired immune deficiency syndrome' },
        { abbreviation: 'ALS', meaning: 'advanced life support' },
        { abbreviation: 'AMA', meaning: 'against medical advice' },
        // ... adding more abbreviations from the file
        { abbreviation: 'WNL', meaning: 'within normal limits' },
        { abbreviation: 'wt', meaning: 'weight' },
        { abbreviation: 'Y/O', meaning: 'years old' }
    ];

    return storeAbbreviations(abbreviations);
}