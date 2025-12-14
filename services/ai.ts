// services/ai.ts
// We use dynamic imports to prevent the application from crashing on startup
// if the SDK fails to load or if the environment is not perfectly configured.

import type { HomeworkResponse, MathPlaygroundResponse } from "../types";

// ---------------------------
// Gemini Config (ENV controlled)
// ---------------------------
const ENV_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
const ENV_MODEL   = (import.meta as any).env?.VITE_GEMINI_MODEL as string | undefined;

const GEMINI_MODEL = ENV_MODEL?.trim() || "gemini-3-pro-preview";


// ---------------------------
// SDK loader + Client factory
// ---------------------------
type GoogleGenAIConstructor = new (args: { apiKey: string }) => {
  models: {
    generateContent: (args: any) => Promise<{ text?: string }>;
  };
};

/**
 * Load Google GenAI SDK dynamically with fallbacks.
 */
const loadGoogleGenAI = async (): Promise<GoogleGenAIConstructor> => {
  const module = await import("@google/genai");
  return module.GoogleGenAI as GoogleGenAIConstructor;
};

/**
 * Helper to get the AI client safely (env only).
 */
const getAIClient = async () => {
  const GoogleGenAI = await loadGoogleGenAI();

  const apiKey = ENV_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Please set it in .env.local or your deployment environment variables."
    );
  }

  return new GoogleGenAI({ apiKey });
};

// ---------------------------
// 1) Simplify text
// ---------------------------
export const getSimplifiedText = async (text: string): Promise<string> => {
  try {
    const ai = await getAIClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are a specialized accessibility assistant for students with learning disabilities (Dyslexia, ADHD, Processing Disorders).

Your task: Rewrite the provided text into "Simple Mode".

STRICT RULES:
1. **Simplify Vocabulary**: Replace complex words with Grade 4-5 level synonyms.
2. **Shorten Sentences**: Break long sentences into two or more short, direct sentences.
3. **Chunking**: Keep paragraphs short (maximum 3 sentences per paragraph).
4. **Concrete Examples**: If the text is abstract, add a brief, concrete example in parentheses or a new sentence.
5. **Formatting**: Use bullet points if listing more than 3 items.
6. **Tone**: Keep it encouraging and friendly, but not childish.
7. **Output**: Return ONLY the simplified text. Do not add headers like "Simplified Version:".

Text to simplify:
${text}`,
      config: {
        temperature: 0.3,
      },
    });

    return response.text || "";
  } catch (error: any) {
    console.error("AI Simplification Service Failed:", error);

    if (error.message?.includes("Failed to load")) {
      throw new Error("Could not load AI library. Please disable ad blockers or check connection.");
    }
    if (error.message?.includes("Missing VITE_GEMINI_API_KEY")) {
      throw new Error("Missing API Key. Please set VITE_GEMINI_API_KEY.");
    }

    throw new Error(error.message || "Could not connect to AI service. Please try again later.");
  }
};

// ---------------------------
// 2) Visual breakdown (Mind Map + Steps)
// ---------------------------
export interface MindMapNode {
  label: string;
  short_explanation: string; // 1 simple sentence
  search_term: string; // keyword for images
  children?: MindMapNode[];
}

export interface VisualStructure {
  topic: string;
  mindMap: MindMapNode;
  steps: {
    title: string;
    description: string;
    icon?: string;
    search_term: string;
  }[];
}

export const getVisualBreakdown = async (text: string): Promise<VisualStructure> => {
  try {
    const ai = await getAIClient();

    const prompt = `
You are an expert visual learning specialist for students with LD.
Analyze the text and create a Visual Structure (Mind Map + Steps).

Target Audience: Children/Students who need simple explanations.

Return valid JSON matching this structure:
{
  "topic": "Main Topic",
  "mindMap": {
    "label": "Central Concept",
    "short_explanation": "Very simple definition (max 10 words).",
    "search_term": "Concept for kids",
    "children": [
      {
        "label": "Sub-concept",
        "short_explanation": "Simple definition.",
        "search_term": "Sub-concept visualization",
        "children": []
      }
    ]
  },
  "steps": [
    {
      "title": "Step 1",
      "description": "Simple explanation.",
      "search_term": "Step 1 action"
    }
  ]
}

Rules:
1. **Labels**: Max 3-4 words.
2. **Explanations**: Max 1 sentence. Easy to read.
3. **Search Terms**: optimized for Google Image Search (e.g. "Frog lifecycle diagram simple").
4. **Structure**: Max depth 3 levels. Max 4 children per node to prevent clutter.

Text to visualize:
${text}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as VisualStructure;
  } catch (error: any) {
    console.error("AI Visualizer Failed:", error);
    throw new Error("Could not generate visual structure. " + (error.message || ""));
  }
};

// ---------------------------
// 3) Task breakdown (ADHD coach)
// ---------------------------
export interface TaskStep {
  id: string;
  text: string;
  durationMin: number;
}

export const getTaskBreakdown = async (task: string): Promise<TaskStep[]> => {
  try {
    const ai = await getAIClient();

    const prompt = `
You are an expert ADHD coach. The user feels overwhelmed by a task.
Your goal: Break this task down into 3-6 tiny, non-scary, actionable steps.

Rules:
1. First step should be ridiculously easy (e.g., "Open the book" or "Put on shoes").
2. Steps should be concrete.
3. Assign an estimated time (5-15 mins) for each step.
4. Return pure JSON format.

Task: "${task}"

JSON Schema:
[
  { "text": "Step description", "durationMin": 5 }
]
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const steps = JSON.parse(response.text || "[]");

    return steps.map((s: any, idx: number) => ({
      id: `step-${Date.now()}-${idx}`,
      text: s.text,
      durationMin: s.durationMin || 5,
    }));
  } catch (error: any) {
    console.error("Task Chunking Failed:", error);
    throw new Error("Could not break down task.");
  }
};

// ---------------------------
// 4) Teacher generator
// ---------------------------
export const generateTeacherMaterial = async (
  topic: string,
  type: "sentences" | "analogy" | "vocab" | "checklist"
): Promise<string> => {
  try {
    const ai = await getAIClient();
    let prompt = "";

    switch (type) {
      case "sentences":
        prompt = `Write 3 simple, clear, declarative sentences explaining "${topic}" for a student with Dyslexia/LD. Focus on active voice and concrete imagery. Format as a bulleted list.`;
        break;
      case "analogy":
        prompt = `Create a real-world analogy to explain "${topic}" to a student who struggles with abstract concepts. Relate it to something like sports, video games, or daily life. Keep it brief.`;
        break;
      case "vocab":
        prompt = `Identify the top 5 key vocabulary words for the topic "${topic}". Provide a very simple, student-friendly definition for each. Format as a list.`;
        break;
      case "checklist":
        prompt = `Create a simple 5-step checklist for a student to complete an assignment about "${topic}". Focus on executive function support (Planning, Doing, Checking).`;
        break;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { temperature: 0.4 },
    });

    return response.text || "No content generated.";
  } catch (error: any) {
    console.error("Teacher Generator Failed", error);
    throw new Error("Generation failed.");
  }
};

// ---------------------------
// 5) Writing idea spark
// ---------------------------
export const generateWritingIdea = async (): Promise<string> => {
  try {
    const ai = await getAIClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Give me one creative, fun, and weird writing prompt for a student. Just the prompt, max 15 words.",
      config: { temperature: 0.9 },
    });
    return response.text || "Write about a flying taco.";
  } catch {
    return "Write about a secret door in your school.";
  }
};

// ---------------------------
// 6) Chat with coach
// ---------------------------
export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const sendChatToCoach = async (
  history: ChatMessage[],
  newMessage: string,
  pageContext: string | null
): Promise<string> => {
  try {
    const ai = await getAIClient();

    const systemPrompt = `
You are a friendly, patient, and encouraging Learning Coach designed to help students with learning differences (Dyslexia, ADHD, etc.).

YOUR PERSONALITY:
- Warm, supportive, and never judgmental.
- You use simple language, short sentences, and emojis.
- You explain things step-by-step.

YOUR GOAL:
- Help the student understand the text they are reading (provided in the Context).
- If they ask for a summary, give a bulleted list.
- If they are stuck, offer an analogy (like video games, sports, or food).
- If they say "I don't get it", break it down even simpler.

CONTEXT RULES:
- The user is currently looking at this text: "${pageContext ? pageContext.substring(0, 2000) : "No specific text selected."}".
- Use this context to answer their questions.

FORMATTING:
- Use bolding for key words.
- Keep responses visually clean (paragraphs under 3 lines).
`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Got it! I am ready to help." }] },
      ...history.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
      { role: "user", parts: [{ text: newMessage }] },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: { temperature: 0.5 },
    });

    return response.text || "I'm having trouble thinking right now. Try again?";
  } catch (error: any) {
    console.error("Chat Error", error);
    return "Oops! My brain froze for a second. Can you say that again?";
  }
};

// ---------------------------
// 7) Multimodal homework analyzer
// ---------------------------
export const analyzeHomeworkImage = async (base64Image: string): Promise<HomeworkResponse> => {
  try {
    const ai = await getAIClient();

    const cleanBase64 = base64Image.split(",")[1];
    const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));

    const prompt = `
You are a Learning Disability (LD) Specialist and Tutor.
Analyze this image (which may be a textbook page, worksheet, or handwritten problem).

Task:
1. Extract the text/problem.
2. Create an "LD Friendly" version of it.

Requirements for LD Friendly Version:
- Use simple vocabulary (Grade 5 level).
- Add line breaks between ideas.
- If it's a math/science problem, break the solution down into numbered steps.
- Provide a "Practice Problem" that is similar but with different numbers/context.

Return JSON format:
{
  "subject": "Math | Science | History | etc",
  "original_text": "The text found in the image",
  "simplified_version": "The rewritten easy-to-read version",
  "key_concepts": ["concept 1", "concept 2"],
  "steps": [
     {"title": "Step 1", "explanation": "What to do first"}
  ],
  "practice_problem": {
     "question": "A similar problem for them to try",
     "hint": "A gentle clue"
  }
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    return JSON.parse(response.text || "{}") as HomeworkResponse;
  } catch (error: any) {
    console.error("Homework Analysis Failed:", error);
    throw new Error("Could not analyze image. " + (error.message || ""));
  }
};

// ---------------------------
// 8) Math playground coach
// ---------------------------
export const askMathCoach = async (input: string, imageBase64?: string): Promise<MathPlaygroundResponse> => {
  try {
    const ai = await getAIClient();

    const systemPrompt = `
You are an interactive Visual Math Coach.

Role:
1. Analyze the user's question AND their drawing on the canvas (if provided).
2. If they draw a circle or point to something, interpret what they mean.
3. Explain the math simply (Grade 4 level).
4. RETURN ACTIONS to draw on the canvas to help explain.

Canvas Coordinates: **1600x900**. Center is **800,450**.

CRITICAL DRAWING RULES:
- Draw EVERYTHING very LARGE and BOLD so it is easy to see.
- Circles should have radius > 80.
- Rectangles should be > 200px wide.
- Use thick lines.

Output JSON Format:
{
  "explanation": "Simple explanation here...",
  "actions": [ ... list of drawing actions ... ]
}

Drawing Actions:
- rect, circle, line, text.
`;

    const parts: any[] = [{ text: input }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.split(",")[1];
      parts.unshift({ inlineData: { mimeType: "image/png", data: cleanBase64 } });
      parts.unshift({ text: "Here is what the user drew on the whiteboard:" });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I will provide JSON drawing actions." }] },
        { role: "user", parts },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as MathPlaygroundResponse;
  } catch (error: any) {
    console.error("Math Coach Failed:", error);
    return { explanation: "I'm having trouble seeing the board right now. Can you try again?", actions: [] };
  }
};
