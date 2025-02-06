import { generateNarrative } from './narrative_gen.js';
import { fetchProtocolData } from './data_fetch.js';

async function handleUserInput(userInput) {
  const protocolData = await fetchProtocolData();
  const narrative = await generateNarrative(userInput, protocolData);
  displayNarrative(narrative);
}

function displayNarrative(narrative) {
  const narrativeOutput = document.getElementById('narrativeOutput');
  narrativeOutput.innerText = narrative;
}

export { handleUserInput };