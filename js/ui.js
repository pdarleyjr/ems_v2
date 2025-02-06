import { fetchProtocolData, getCurrentImagePath, cycleProtocolImage } from './data_fetch.js';

// Form state management
let formState = {
  currentProtocol: null,
  imageEnlarged: false
};

// Load prefill options for form fields
async function loadPrefillOptions() {
  try {
    const response = await fetch('./prefillOptions.json');
    const options = await response.json();
    return options;
  } catch (error) {
    console.error('Error loading prefill options:', error);
    return {};
  }
}

// Initialize all form dropdowns
async function initializeFormFields() {
  const options = await loadPrefillOptions();
  
  // Map of all select elements that need to be populated
  const selectFields = [
    'unitNumber', 'dispatchNature', 'responseDelay',
    'patientPresentation', 'distressLevel', 'chiefComplaint',
    'additionalUnits', 'locAssessment', 'gcsScore',
    'alertOriented', 'pupils', 'rxTreatment',
    'conditionStatus', 'ongoingAssessment', 'transportMethod',
    'patientPosition', 'transportVia', 'hospitalSelection'
  ];

  selectFields.forEach(fieldId => {
    const selectElement = document.getElementById(fieldId);
    if (selectElement && options[fieldId]) {
      // Clear existing options
      selectElement.innerHTML = '<option value="">Select...</option>';
      
      // Add new options
      options[fieldId].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;
        selectElement.appendChild(optionElement);
      });

      // Add change event listener for form state persistence
      selectElement.addEventListener('change', () => {
        formState[fieldId] = selectElement.value;
      });
    }
  });

  // Initialize pertinent negatives
  initializePertinentNegatives(options.pertinentNegatives);

  // Initialize vitals ranges
  initializeVitalsSection(options.vitalsRanges);
}

// Initialize pertinent negatives checkboxes
function initializePertinentNegatives(negatives) {
  const container = document.getElementById('pertinentNegatives');
  if (!container || !negatives) return;

  Object.entries(negatives).forEach(([category, items]) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'checkbox-category';
    
    const title = document.createElement('div');
    title.className = 'checkbox-category-title';
    title.textContent = category.replace(/Negatives$/, '').replace(/([A-Z])/g, ' $1').trim();
    
    const checkboxList = document.createElement('div');
    checkboxList.className = 'checkbox-list';

    items.forEach(item => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `neg_${item.replace(/\s+/g, '_')}`;
      checkbox.name = 'pertinentNegatives';
      checkbox.value = item;

      checkbox.addEventListener('change', () => {
        formState[checkbox.id] = checkbox.checked;
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(item));
      checkboxList.appendChild(label);
    });

    categoryDiv.appendChild(title);
    categoryDiv.appendChild(checkboxList);
    container.appendChild(categoryDiv);
  });
}

// Initialize vitals section
function initializeVitalsSection(vitalsRanges) {
  const vitalsNormal = document.getElementById('vitalsNormal');
  const vitalsDetails = document.getElementById('vitalsDetails');
  
  if (!vitalsNormal || !vitalsDetails || !vitalsRanges) return;

  // Create vitals input fields
  const normalRanges = vitalsRanges.normal;
  Object.entries(normalRanges).forEach(([vital, range]) => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const label = document.createElement('label');
    label.htmlFor = `vital_${vital}`;
    label.textContent = `${vital.replace(/([A-Z])/g, ' $1').trim()} (${range})`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `vital_${vital}`;
    input.name = vital;
    
    input.addEventListener('change', () => {
      formState[input.id] = input.value;
    });

    formGroup.appendChild(label);
    formGroup.appendChild(input);
    vitalsDetails.appendChild(formGroup);
  });

  vitalsNormal.addEventListener('change', () => {
    vitalsDetails.style.display = vitalsNormal.checked ? 'none' : 'block';
    formState.vitalsNormal = vitalsNormal.checked;
  });
}

// Tab Management
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Save current tab's form data
      saveTabData(document.querySelector('.tab-content.active'));

      // Switch tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      // Load saved data for the new tab
      loadTabData(document.getElementById(tabId));

      // Update protocol image when switching to assessment tab
      if (tabId === 'assessment' && formState.currentProtocol) {
        updateProtocolImage(formState.currentProtocol);
      }
    });
  });
}

// Update protocol image display
function updateProtocolImage(protocol) {
  const protocolImageContainer = document.getElementById('protocolImage');
  const img = protocolImageContainer.querySelector('img');
  const imageCounter = document.getElementById('imageCounter');
  
  if (protocol?.imagePaths?.length > 0) {
    const currentPath = getCurrentImagePath(protocol);
    img.src = currentPath;
    img.alt = protocol.title;
    protocolImageContainer.classList.add('visible');
    
    // Update image counter
    if (protocol.imagePaths.length > 1) {
      imageCounter.textContent = `Image ${protocol.currentImageIndex + 1} of ${protocol.imagePaths.length}`;
      imageCounter.style.display = 'block';
    } else {
      imageCounter.style.display = 'none';
    }
  } else {
    protocolImageContainer.classList.remove('visible');
    imageCounter.style.display = 'none';
  }
}

// Save tab data to form state
function saveTabData(tabContent) {
  if (!tabContent) return;
  
  const inputs = tabContent.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      formState[input.id || input.name] = input.checked;
    } else if (input.type === 'radio') {
      if (input.checked) {
        formState[input.name] = input.value;
      }
    } else {
      formState[input.id || input.name] = input.value;
    }
  });
}

// Load tab data from form state
function loadTabData(tabContent) {
  if (!tabContent) return;

  const inputs = tabContent.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const stateKey = input.id || input.name;
    if (formState[stateKey] !== undefined) {
      if (input.type === 'checkbox') {
        input.checked = formState[stateKey];
      } else if (input.type === 'radio') {
        input.checked = (formState[input.name] === input.value);
      } else {
        input.value = formState[stateKey];
      }
    }
  });
}

// Protocol Selection and Image Display
async function initializeProtocolSelection() {
  const protocolSelect = document.getElementById('protocolSelect');
  const protocolSummary = document.getElementById('protocolSummary');
  const protocolImageContainer = document.getElementById('protocolImage');
  const protocolImage = protocolImageContainer.querySelector('img');
  
  const protocols = await fetchProtocolData();
  
  // Populate protocol dropdown
  protocolSelect.innerHTML = '<option value="">Select Protocol...</option>';
  protocols.sort((a, b) => a.title.localeCompare(b.title)).forEach(protocol => {
    const option = document.createElement('option');
    option.value = protocol.title;
    option.textContent = protocol.title;
    protocolSelect.appendChild(option);
  });

  // Handle protocol selection
  protocolSelect.addEventListener('change', async () => {
    const selectedProtocol = protocols.find(p => p.title === protocolSelect.value);
    if (selectedProtocol) {
      protocolSummary.textContent = selectedProtocol.summary || '';
      formState.currentProtocol = selectedProtocol;
      
      // Update image only if assessment tab is active
      const assessmentTab = document.getElementById('assessment');
      if (assessmentTab.classList.contains('active')) {
        updateProtocolImage(selectedProtocol);
      }
    } else {
      protocolSummary.textContent = '';
      formState.currentProtocol = null;
      updateProtocolImage(null);
    }
  });

  // Handle image click for multi-image protocols
  protocolImageContainer.addEventListener('click', () => {
    if (formState.currentProtocol?.imagePaths?.length > 1) {
      formState.currentProtocol = cycleProtocolImage(formState.currentProtocol);
      updateProtocolImage(formState.currentProtocol);
    } else {
      // Toggle enlarge for single image protocols
      formState.imageEnlarged = !formState.imageEnlarged;
      protocolImageContainer.classList.toggle('enlarged', formState.imageEnlarged);
    }
  });
}

// Call Outcome and Refusal
function initializeCallOutcome() {
  const callOutcome = document.getElementById('callOutcome');
  const transportDetails = document.getElementById('transportDetails');
  const refusalDetails = document.getElementById('refusalDetails');
  const refusalNotes = document.getElementById('refusalNotes');

  callOutcome?.addEventListener('change', () => {
    const value = callOutcome.value;
    transportDetails.style.display = value === 'transport' ? 'block' : 'none';
    refusalDetails.style.display = value === 'refusal' ? 'block' : 'none';

    if (value === 'refusal') {
      refusalNotes.value = `Patient has been informed of the risks of refusing medical treatment and/or transport, including but not limited to worsening condition, disability, or death. Patient demonstrates decision-making capacity and understands the risks of refusal. Patient has been advised to seek immediate medical attention if symptoms worsen or new symptoms develop, and to call 911 if needed. Patient has been offered transport to the hospital and refuses. Patient signs refusal form.`;
      formState.refusalNotes = refusalNotes.value;
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeFormFields();
    await initializeProtocolSelection();
    initializeTabs();
    initializeCallOutcome();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});