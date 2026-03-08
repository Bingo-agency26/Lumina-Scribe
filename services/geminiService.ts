import { GoogleGenAI } from "@google/genai";
import { GenerationParams, ContentType, Language, AspectRatio } from '../types';

// Custom Error Classes for better handling in UI
export class AIError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'AIError';
  }
}

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing from environment variables.");
    return null;
  }
  return key;
};

// Input Validation
const validateInput = (prompt: string, params: GenerationParams) => {
  if (!prompt || prompt.trim().length < 5) {
    throw new AIError("Prompt is too short. Please provide at least 5 characters.");
  }
  if (prompt.length > 10000) {
    throw new AIError("Prompt is too long. Please condense your request.");
  }
};

const getSystemInstruction = (type: ContentType, params: GenerationParams, language: Language): string => {
  const baseInstruction = `You are LuminaScribe, an expert AI content creator.`;
  
  // Persona Injection
  const personaInstruction = params.jobTitle 
    ? `You are acting as a professional ${params.jobTitle}. Adopt this specific persona, perspective, jargon, and level of expertise in your writing.` 
    : "Adopt a professional, authoritative, yet engaging expert persona.";

  let specificInstruction = "";
  
  switch(type) {
    case 'social_post':
      const platforms = params.platforms && params.platforms.length > 0 ? params.platforms.join(' and ') : 'social media';
      specificInstruction = `Create a viral-worthy social media post for ${platforms}. Tone: ${params.tone}. strictly adhere to platform best practices (hashtags, length, formatting).`;
      break;
    case 'blog_article':
      specificInstruction = `Write a comprehensive, SEO-optimized blog article. Tone: ${params.tone}. Use strict Markdown formatting (H1 for title, H2/H3 for subsections, bullet points).`;
      break;
    case 'email':
      specificInstruction = `Write a high-conversion email. Goal: ${params.goal || 'general communication'}. Tone: ${params.tone}. Subject line must be included.`;
      break;
    case 'video_script':
      specificInstruction = `Create a video script. Tone: ${params.tone}. Format: [VISUAL CUE] Audio/Speech.`;
      break;
    case 'product_description':
      specificInstruction = `Write a persuasive product description. Tone: ${params.tone}. Highlight benefits over features.`;
      break;
  }

  const lengthInstruction = params.length === 'short' ? "Keep it concise and punchy (under 100 words)." : 
                            params.length === 'medium' ? "Balance detail with brevity (150-300 words)." : 
                            "Provide deep insights and comprehensive detail (over 500 words).";
  
  const emojiInstruction = params.includeEmojis ? "Use emojis strategically to enhance engagement but don't overdo it." : "Do not use emojis.";

  const langInstruction = language === 'fr' ? "IMPORTANT: You MUST reply in FRENCH (Français)." : "IMPORTANT: You MUST reply in ENGLISH.";

  return `${baseInstruction} ${personaInstruction} ${specificInstruction} ${lengthInstruction} ${emojiInstruction} ${langInstruction} Return the result in clean Markdown format.`;
};

// Retry utility with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    const isRetryable = error?.status === 429 || error?.status >= 500 || error?.message?.includes('overloaded');
    
    if (!isRetryable) throw error;

    const delay = baseDelay * Math.pow(2, 3 - retries);
    console.warn(`Attempt failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, retries - 1, baseDelay);
  }
}

export const generateContentStream = async (
  prompt: string,
  type: ContentType,
  params: GenerationParams,
  language: Language,
  onChunk: (text: string) => void
) => {
  const apiKey = getApiKey();
  if (!apiKey) {
      throw new AIError("System configuration error: API Key missing.");
  }

  // Validate before request
  try {
    validateInput(prompt, params);
  } catch (e) {
    throw e;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const systemInstruction = getSystemInstruction(type, params, language);
    
    await withRetry(async () => {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      for await (const chunk of responseStream) {
         const text = chunk.text;
         if (text) {
           onChunk(text);
         }
      }
    });

  } catch (error: any) {
    console.error("GeminiService Error:", error);
    
    if (error instanceof AIError) throw error;
    handleCommonErrors(error);
  }
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // Construct a specific image generation prompt based on the user content context
    const imagePrompt = `High quality, professional image representing: ${prompt}. Photorealistic, 4k, detailed, cinematic lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
          // imageSize is NOT supported for gemini-2.5-flash-image, only for gemini-3-pro-image-preview
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    // We do not throw here to avoid blocking text generation if image fails
    return null;
  }
};

const handleCommonErrors = (error: any) => {
    // Map raw API errors to user-friendly messages
    if (error.message?.includes('403') || error.message?.includes('key')) {
        throw new AIError("Access denied. Please check your API key permissions.");
    }
    if (error.message?.includes('404')) {
        throw new AIError("AI Model currently unavailable. Please try again later.");
    }
    if (error.message?.includes('429')) {
        throw new AIError("System is busy. We are strictly rate-limited, please wait a moment.");
    }
    throw new AIError("An unexpected error occurred.", "UNKNOWN", error);
}