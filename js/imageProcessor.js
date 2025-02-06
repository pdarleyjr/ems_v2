// Image processing utilities for protocol procedures
import { storeProtocolImage, getProtocolImages } from './db.js';

// Convert an image file to base64
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Load and process a procedure image
export async function loadProcedureImage(imagePath) {
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return await fileToBase64(blob);
    } catch (error) {
        console.error('Error loading procedure image:', error);
        throw error;
    }
}

// Convert display name to protocol ID format
function displayNameToId(displayName) {
    return displayName.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

// Map protocol IDs to page numbers based on verified content
const protocolImageMapping = {
    // Verified mappings (content confirmed)
    'ABDOMINAL_PAIN': [1],                // Verified: Adult Abdominal Pain
    'ABUSE_REPORTING_AND_COMMUNITY_SERVICE': [2],  // Verified: Adult Abuse Reporting
    'AGITATED_PATIENT_EXCITED_DELIRIUM_SYNDROME': [3],  // Verified: The Agitated Patient/Excited Delirium
    'AICD_AUTOMATIC_IMPLANTABLE_CARDIOVERTER_DEFIBRILLATOR': [4],  // Verified: Automatic Implantable Cardioverter/Defibrillator
    'AIRWAY_MANAGEMENT': [5, 6, 7],       // Verified: Adult Airway (Absent/Compromised + Complete Obstruction + Initial Assessment)
    'ALCOHOL_INTOXICATION': [8],          // Verified: Alcohol Intoxication
    'ALLERGIC_SYSTEMIC_REACTIONS': [9],  // Verified: Allergic - Systemic Reactions
    'BACK_PAIN': [10],                    // Verified: Back Pain
    'BITES_AND_STINGS': [11],             // Verified: Adult Bites and Stings
    'BRADYCARDIA': [12],                  // Verified: Adult Bradycardia
    'CARDIAC_ARREST': [13, 14],           // Verified: Adult Cardiac Arrest (Asystole/PEA + VF/Pulseless VT)
    'CHEST_PAIN_STEMI': [15],             // Verified: Chest Pain/STEMI
    'CO_CN_EXPOSURE': [16],               // Verified: Adult CO/CN Exposure
    'POISONING_DRUG_OVERDOSE': [17, 18], // Verified: Adult Drug Overdose (Parts 1 & 2)
    'ENVIRONMENTAL_EMERGENCIES': [19, 20], // Verified: Electrical/Lightning Injuries + Environmental Emergencies
    'EPISTAXIS': [21],                    // Verified: Epistaxis (Nosebleed)
    'FIREFIGHTER_REHABILITATION': [22],    // Verified: Firefighter Rehabilitation
    'HYPERTENSIVE_EMERGENCIES': [23],      // Verified: Adult Hypertensive Emergencies
    'HYPOTENSION_SHOCK': [24],             // Verified: Adult Hypotension/Shock
    'IMPAIRED_OR_ALTERED_CONSCIOUSNESS': [25], // Verified: Adult Impaired or Altered Consciousness
    'DEATH_IN_FIELD': [26],               // Verified: Natural Death in the Field
    'OB_CHILD_BIRTH_EMERGENCIES': [27],  // Verified: OB/Childbirth Emergencies
    'PAIN_AND_NAUSEA_VOMITING_MANAGEMENT': [28], // Verified: Adult Pain and Nausea/Vomiting Management
    'PEPPER_SPRAY_EXPOSURES': [29],        // Verified: Pepper Spray Exposures
    'POST_RESUSCITATION': [30],            // Verified: Adult Post Resuscitation
    'PSYCHIATRIC_EMERGENCIES': [31],        // Verified: Psychiatric Emergencies
    'BAKER_ACT_MARCHMAN_ACT': [31],      // Verified: Baker Act/Marchman Act (part of Psychiatric Emergencies)
    'RAPE_MANAGEMENT': [32],               // Verified: Rape Management
    'RESPIRATORY_EMERGENCIES': [33, 34, 35], // Verified: COPD/Asthma/Emphysema + Cough with Fever + Distress with Rales
    'SEIZURES': [36],                      // Verified: Adult Seizures
    'SICKLE_CELL_PATIENTS': [37],          // Verified: Sickle Cell Patients Pain Crisis
    'STROKE': [38],                        // Verified: Stroke
    'SYNCOPE': [39],                       // Verified: Syncope
    'TACHYCARDIA': [40, 41],               // Verified: Adult Narrow + Wide Complex Tachycardia
    'TASER_EXPOSURES': [42],               // Verified: Taser Exposures
    'THERAPEUTIC_HYPOTHERMIA': [43],        // Verified: Therapeutic Hypothermia
    'VENTRICULAR_ASSIST_DEVICE': [45],      // Verified: Ventricular Assist Device
    'WATER_RELATED_EMERGENCIES': [46],      // Verified: Water Related Emergencies
    'TRAUMA': [47, 48, 49, 50, 51, 52, 53, 54, 55, 56] // Verified: Adult Trauma (Amputations, Burns, Crush Injuries, Entrapment, Eye Injuries, Fractures/Dislocations, Head/Spinal, Hypovolemic Shock, Pregnancy, Soft Tissue)
};

// Store images for a specific protocol
export async function storeProtocolImages(protocolId) {
    const id = displayNameToId(protocolId);
    const pageNumbers = protocolImageMapping[id];
    if (!pageNumbers) {
        console.warn(`No image mapping found for protocol: ${protocolId} (ID: ${id})`);
        return;
    }

    const results = [];
    for (const pageNumber of pageNumbers) {
        try {
            // Format page number with leading zeros (01, 02, etc.)
            const formattedPage = String(pageNumber).padStart(2, '0');
            const imagePath = `procedures/procedures_Page_${formattedPage}.jpg`;
            const imageData = await loadProcedureImage(imagePath);
            await storeProtocolImage(id, imageData, pageNumber);
            results.push({ pageNumber, status: 'success' });
        } catch (error) {
            console.error(`Error storing image for ${protocolId}, page ${pageNumber}:`, error);
            results.push({ pageNumber, status: 'error', error: error.message });
        }
    }
    return results;
}

// Initialize image storage for all protocols
export async function initializeProtocolImages() {
    const results = {};
    for (const protocolId of Object.keys(protocolImageMapping)) {
        try {
            results[protocolId] = await storeProtocolImages(protocolId);
        } catch (error) {
            console.error(`Error initializing images for ${protocolId}:`, error);
            results[protocolId] = { status: 'error', error: error.message };
        }
    }
    return results;
}

// Get cached images for a protocol, loading from files if not in cache
export async function getProtocolImagesWithFallback(protocolId) {
    try {
        // Convert display name to protocol ID format
        const id = displayNameToId(protocolId);
        console.log(`Looking up images for protocol: ${protocolId} (ID: ${id})`);

        // Try to get images from IndexedDB first
        const cachedImages = await getProtocolImages(id);
        if (cachedImages && cachedImages.length > 0) {
            console.log(`Found ${cachedImages.length} cached images for ${id}`);
            return cachedImages;
        }

        // If no cached images, load and store them
        console.log(`No cached images found for ${id}, loading from files...`);
        await storeProtocolImages(protocolId);
        return await getProtocolImages(id);
    } catch (error) {
        console.error(`Error getting images for ${protocolId}:`, error);
        throw error;
    }
}

// Check if a protocol has associated images
export function hasProtocolImages(protocolId) {
    const id = displayNameToId(protocolId);
    return id in protocolImageMapping;
}

// Get the page numbers associated with a protocol
export function getProtocolPageNumbers(protocolId) {
    const id = displayNameToId(protocolId);
    return protocolImageMapping[id] || [];
}

// Get all mapped protocols
export function getMappedProtocols() {
    return Object.keys(protocolImageMapping);
}

// Get all mapped page numbers
export function getMappedPages() {
    const pages = new Set();
    Object.values(protocolImageMapping).forEach(pageNumbers => {
        pageNumbers.forEach(page => pages.add(page));
    });
    return Array.from(pages).sort((a, b) => a - b);
}

// Get verification status of a protocol mapping
export function getProtocolVerificationStatus(protocolId) {
    const id = displayNameToId(protocolId);
    return id in protocolImageMapping ? 'verified' : 'unverified';
}