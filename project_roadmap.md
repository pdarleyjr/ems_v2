# EMS Narrative Generator Project Roadmap

## Phase 1: Address Critical Errors and Improve Stability (Immediate)

* **Resolve Pantry API Fetch Error:** The Pantry API key and relevant endpoints are:
    * `unique PantryID`: `689ac997-c785-41d8-b7ab-22f9bd66c2b6`
    * `Get Details`: `https://getpantry.cloud/apiv1/pantry/YOUR_PANTRY_ID` (replace YOUR_PANTRY_ID)
    * `Get Contents`: `https://getpantry.cloud/apiv1/pantry/YOUR_PANTRY_ID/basket/YOUR_BASKET_NAME` (replace YOUR_PANTRY_ID and YOUR_BASKET_NAME)
    * Investigate the cause of the "Failed to fetch protocols from Pantry" error. Possible causes include:
    * Incorrect Pantry API key. Verify the key's validity and ensure it's correctly integrated into the code.
    * Network connectivity issues. Test the API endpoint directly in a browser to rule out network problems.
    * Incorrect API endpoint URL. Double-check the URL in `fetchProtocols` function.
    * Rate limiting or API issues on Pantry's side. Check Pantry's status page for any outages or limitations.
* **Improve Error Handling:** Implement more robust error handling in the `fetchProtocols` function to provide more informative error messages to the user.  Consider displaying a user-friendly message instead of a generic error.  **COMPLETE**
* **Address Source Map Error:** This error is likely related to the browser's developer tools and not the application's core functionality.  However, fixing it will improve the debugging experience.  Ensure the source map file (`installHook.js.map`) is correctly generated and accessible. **COMPLETE**

## Phase 2: Enhance Structure and Maintainability (Short-Term)

* **Modularize Code:** Break down the `index.html` JavaScript code into separate modules for better organization and maintainability.  Create separate files for:
    * Data fetching (Pantry API, IndexedDB)
    * UI logic
    * Narrative generation
    * Protocol search functionality (new)
* **Implement UI Enhancements:** Implement the new "Search for Protocol" button and associated functionality, including dynamic updates to the UI and a mechanism for replacing existing information.  Consider using a modal or collapsible section for the search results.

## Phase 3: Add Features and Enhancements (Long-Term)

* **Advanced Narrative Generation:** Implement advanced narrative generation using tf.js and USE. This will involve:
    * Embedding user input and matched protocol text using USE.
    * Computing similarity scores between user input and protocol sentences.
    * Selecting top-ranked protocol sentences based on similarity.
    * Merging selected protocol sentences into the generated narrative under appropriate sections.
    * Ensuring each section is its own paragraph in the final narrative.  Use the provided narrative template as a reference for structure.
    * Implementing JavaScript functions for embedding, similarity computation, and merging.  Consider using cosine similarity for comparing embeddings.
    * Store or embed the provided narrative template for use by the tf.js/USE model.  Consider storing it in IndexedDB or embedding it directly in the JavaScript code.  The template should be used to structure the generated narrative, regardless of whether protocol information is merged.
* **Protocol Search Feature:** Implement a "Search for Protocol" button that allows users to search the Pantry API for protocols, medications, and other relevant information based on keywords.  The search results should dynamically update relevant sections (Chief Complaint, Treatment, Transport).  Include a mechanism for replacing existing information with new selections.
* **CSS Styling:** Update CSS to change the text color for better readability.
    * Data fetching (Pantry API, IndexedDB)
    * UI logic
    * Narrative generation
* **Implement Configuration File:** Create a separate configuration file (e.g., `config.json`) to store the Pantry API key and other configurable settings. This will improve security and make it easier to manage settings.
* **Version Control:** Ensure the project is under version control (e.g., Git).

## Project Structure Proposal

```
ems-narrative-generator/
├── index.html
├── js/
│   ├── api.js          // Pantry API interaction
│   ├── ui.js           // UI logic and event handling
│   ├── narrative.js    // Narrative generation logic
│   └── indexeddb.js    // IndexedDB interaction
├── config.json         // Configuration settings (API key, etc.)
└── README.md