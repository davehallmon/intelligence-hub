// Intelligence Hub v8.1 — client-side topic taxonomy and classifier.
// Labels intentionally mirror the tracked-topic taxonomy used by the Launchpad.

export const TOPIC_DEFINITIONS = Object.freeze([
  { label: "AI Agents", patterns: [/\bagentic\b/i, /\bai agents?\b/i, /\bautonomous agents?\b/i, /\bmulti[- ]agent\b/i, /\bagentic systems?\b/i] },
  { label: "AI as Normal Technology", patterns: [/\bai as normal technology\b/i, /\bnormal technology\b/i] },
  { label: "AI Copyright & Data Poisoning", patterns: [/\bai copyright\b/i, /\bcopyright.{0,30}(ai|model|training)/i, /\btraining data rights?\b/i, /\bdata poisoning\b/i, /\bmodel poisoning\b/i] },
  { label: "AI Ethics & Bias", patterns: [/\bai ethics\b/i, /\bresponsible ai\b/i, /\balgorithmic bias\b/i, /\bmodel bias\b/i, /\bai fairness\b/i, /\bai discrimination\b/i] },
  { label: "AI in Science", patterns: [/\bai for science\b/i, /\bai in science\b/i, /\bscientific discovery\b/i, /\bai[- ]driven drug discovery\b/i, /\bprotein folding\b/i] },
  { label: "AI Literacy", patterns: [/\bai literacy\b/i, /\bai fluency\b/i, /\bai skills?\b/i, /\bteaching (with|about) ai\b/i] },
  { label: "AI Regulation & Policy", patterns: [/\bai regulation\b/i, /\bai policy\b/i, /\bai governance\b/i, /\bai act\b/i, /\bai legislation\b/i, /\bregulat(?:e|ing|ion).{0,25}artificial intelligence\b/i] },
  { label: "AI Safety & Alignment", patterns: [/\bai safety\b/i, /\bmodel safety\b/i, /\bai alignment\b/i, /\balignment research\b/i, /\bexistential risk\b/i, /\bx[- ]risk\b/i, /\bsuperalignment\b/i] },
  { label: "AI-powered Coding", patterns: [/\bai[- ]powered coding\b/i, /\bai coding\b/i, /\bcoding agents?\b/i, /\bcode generation\b/i, /\bsoftware engineering agents?\b/i, /\bai code assistants?\b/i] },
  { label: "Context Engineering", patterns: [/\bcontext engineering\b/i, /\bcontext window engineering\b/i, /\bcontext management\b/i] },
  { label: "Cost & Latency Optimization", patterns: [/\binference cost\b/i, /\btoken cost\b/i, /\blatency optimization\b/i, /\binference latency\b/i, /\bthroughput optimization\b/i, /\bcost[- ]efficient inference\b/i] },
  { label: "Creative AI Workflows", patterns: [/\bcreative ai\b/i, /\bai creative workflow/i, /\bai[- ]assisted design\b/i, /\bai[- ]assisted writing\b/i, /\bgenerative (image|video|audio) workflow/i] },
  { label: "DPO", patterns: [/\bdirect preference optimization\b/i, /\bdpo\b/i] },
  { label: "Edge AI", patterns: [/\bedge ai\b/i, /\bon[- ]device ai\b/i, /\bon device inference\b/i] },
  { label: "Fine-tuning", patterns: [/\bfine[- ]?tuning\b/i, /\bparameter[- ]efficient fine[- ]?tuning\b/i, /\bpeft\b/i, /\blora\b/i] },
  { label: "LLM-as-a-Judge", patterns: [/\bllm[- ]as[- ]a[- ]judge\b/i, /\bllm as (?:a )?judge\b/i, /\bmodel[- ]based evaluator\b/i] },
  { label: "Multimodal AI", patterns: [/\bmultimodal\b/i, /\bvision[- ]language model\b/i, /\bvlm\b/i, /\btext[- ]image model\b/i] },
  { label: "Open Source vs. Closed Source", patterns: [/\bopen[- ]source (?:ai |language |foundation )?models?\b/i, /\bopen weights?\b/i, /\bclosed[- ]source (?:ai |language |foundation )?models?\b/i, /\bproprietary ai models?\b/i] },
  { label: "Prompt Engineering", patterns: [/\bprompt engineering\b/i, /\bprompt design\b/i, /\bsystem prompts?\b/i] },
  { label: "Quantization", patterns: [/\bquantization\b/i, /\bquantized models?\b/i, /\b4[- ]bit inference\b/i, /\b8[- ]bit inference\b/i, /\bint4\b/i, /\bint8\b/i] },
  { label: "RAG", patterns: [/\bretrieval[- ]augmented generation\b/i, /\bretrieval augmented generation\b/i, /\brag systems?\b/i, /\brag pipeline\b/i] },
  { label: "RLHF", patterns: [/\breinforcement learning from human feedback\b/i, /\brlhf\b/i] },
  { label: "Synthetic Data Generation", patterns: [/\bsynthetic data generation\b/i, /\bsynthetic training data\b/i, /\bsynthetic datasets?\b/i] }
]);

export const TOPIC_LABELS = Object.freeze(TOPIC_DEFINITIONS.map(topic => topic.label));

export function classifyTopics(values, seededTopics = []) {
  const haystack = (Array.isArray(values) ? values : [values])
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const found = new Set(seededTopics.filter(topic => TOPIC_LABELS.includes(topic)));
  if (!haystack) return [...found];

  TOPIC_DEFINITIONS.forEach(topic => {
    if (topic.patterns.some(pattern => pattern.test(haystack))) found.add(topic.label);
  });

  return [...found];
}
