// Import TensorFlow.js and USE
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Narrative template
const narrativeTemplate = `[unit number drop down menu] was dispatched to a [dispatch nature test box]. 

[Unit number copied from previous selection] responded code 3 (emergency), with lights and sirens. [Response delays drop down menu]

Upon arrival to the scene we found the patient [patient presentation]. The general impression of the patient
was [distress level].  The chief complaint for the patient was [chief complaint]. [additional units on scene].  [ANY OTHER RELEVANT INFO TEXT BOX] 


A complete head to toe ALS initial assessment on the patient was performed. Patient was [LOC Assessment].
HEAD/NEURO: [GCS Score], [Alert, Awake, and Oriented Score], [Pupils]. [PRESENT ILLNESS / INJURY INFORMATION]  [Relevant Medical History]  Vital signs were [vital sign assessment]. [Pertinent negatives].  A detailed BLS assessment was performed and the patient [DCAP-BTLS assessment] 
OTHER: [ANY OTHER RELEVANT INFO TEXT BOX]

[RX / TREATMENT (list all treatment provided followed by the next two statements after each treatment or medication provided)] The patient's condition [condition status] Authorized by protocol (standing order).  An ongoing assessment was performed every 5 minutes. Patient states [condition status].

Patient was [how was the patient moved to the stretcher]. Patient was secured to stretcher using stretcher straps and stretcher was secured into the rescue. Patient was positioned on stretcher in [pts position on the stretcher] position.  Patient was transported without incident and without delay. Patient was transported via [ALS / BLS status] to [hospital selection]. Patient moved  from stretcher to emergency department cot via two person sheet lift.  All of patient's belongings were turned over to the hospital staff and/or patient.  The person taking over care was [RN name].  They were given a verbal patient report that included the patient's chief complaint, medical history, medications, allergies, and  all relevant information involving the pts condition.  Patient signed consent on computer form. Nurse signed for patient transfer of care on computer.`;


async function generateNarrative(userInput, protocolText) {
  // Load USE model
  const model = await use.load();

  // Embed user input and protocol text
  const userInputEmbedding = await model.embed(userInput);
  const protocolEmbeddings = await model.embed(protocolText.split('. '));


  // Compute similarity scores (cosine similarity)
  const similarityScores = protocolEmbeddings.map(embedding => {
    return tf.losses.cosineDistance(userInputEmbedding, embedding, 0).dataSync()[0];
  });

  // Select top-ranked sentences
  const topSentenceIndices = similarityScores.map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Select top 5 sentences
    .map(item => item.index);

  // Merge selected sentences into narrative
  const selectedSentences = topSentenceIndices.map(index => protocolText.split('. ')[index].trim());
  let mergedNarrative = narrativeTemplate;

  // Basic merging (replace placeholders -  needs improvement for real-world scenarios)
  mergedNarrative = mergedNarrative.replace('[PRESENT ILLNESS / INJURY INFORMATION]', selectedSentences.join('. '));


  return mergedNarrative;
}


export { generateNarrative };