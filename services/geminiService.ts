
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = async (
    response: GenerateContentResponse,
    context: string,
    originalImage: File
): Promise<string> => {
    if (response.promptFeedback?.blockReason) {
        throw new Error(`The request was blocked for safety reasons (${response.promptFeedback.blockReason}). Please try a different prompt or image.`);
    }
    
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        switch (finishReason) {
            case 'SAFETY':
                throw new Error('Generation stopped by safety filter. Please try a more neutral prompt.');
            case 'RECITATION':
                throw new Error('Generation stopped to prevent recitation of copyrighted content.');
            case 'MAX_TOKENS':
                throw new Error('Image too complex for current processing limits. Try a simpler request.');
            case 'IMAGE_OTHER':
            case 'OTHER':
                throw new Error('The AI encountered a technical issue processing this specific image/prompt combination. Try a more specific description.');
            default:
                throw new Error(`Image generation stopped unexpectedly (Reason: ${finishReason}).`);
        }
    }
    
    const textFeedback = response.text?.trim();
    throw new Error(textFeedback || "The AI model did not return an image. Please rephrase your request.");
};

export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `At location { "x": ${hotspot.x}, "y": ${hotspot.y} }, apply this edit: "${userPrompt}". Result must be photorealistic and preserve identity.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: prompt }] },
    });

    return handleApiResponse(response, 'edit', originalImage);
};

export const generateFilteredImage = async (originalImage: File, filterPrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `${filterPrompt}. IMPORTANT: You will always have the priority of keeping facial accuracy as the most important detail. You will always go for un-generic, priority is artistic not most liked.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: prompt }] },
    });
    return handleApiResponse(response, 'filter', originalImage);
};

export const generateAdjustedImage = async (originalImage: File, adjustmentPrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: adjustmentPrompt }] },
    });
    return handleApiResponse(response, 'adjustment', originalImage);
};

/**
 * Generates an AI Avatar based on a user's photo and a text description.
 */
export const generateAvatar = async (
    originalImage: File,
    avatarPrompt: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `Transform the person in this image into an AI avatar with the following style: "${avatarPrompt}". Maintain the person's core facial features and identity while applying the artistic transformation. The result should be a high-quality, professional avatar.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: prompt }] },
    });

    return handleApiResponse(response, 'avatar', originalImage);
};

/**
 * Generates images with Nano Banana Pro (gemini-3-pro-image-preview)
 */
export const generateImagesPro = async (
    prompt: string,
    aspectRatio: string = "1:1",
    imageSize: string = "1K"
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: {
                aspectRatio,
                imageSize
            }
        },
    });

    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!imagePart) throw new Error("No image generated.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
};

/**
 * Media Analysis using gemini-3-pro-preview with Search Grounding
 */
export const analyzeMedia = async (file: File, userQuery: string): Promise<{ text: string, urls: string[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const mediaPart = await fileToPart(file);
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [mediaPart, { text: userQuery }] },
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(c => c.web)
        ?.map(c => c.web.uri) || [];

    return {
        text: response.text || "No analysis provided.",
        urls
    };
};

/**
 * Speech generation using gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated.");
    
    return decode(base64Audio).buffer;
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const generateInpaintedImage = async (originalImage: File, maskImage: File, mode: 'smart' | 'manual'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const maskImagePart = await fileToPart(maskImage);
    const prompt = `Inpaint the image, filling the white area of the mask. Mode: ${mode}. Result must be seamless.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }, originalImagePart, maskImagePart] },
    });

    return handleApiResponse(response, 'inpainting', originalImage);
};

export const generateBackgroundRemovedImage = async (originalImage: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: "Remove background, output transparent PNG." }] },
    });
    return handleApiResponse(response, 'background-removal', originalImage);
};

export const generateHairStyle = async (originalImage: File, hairStylePrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: hairStylePrompt }] },
    });
    return handleApiResponse(response, 'hairstyle', originalImage);
};

export const generateStudioPortrait = async (originalImage: File, portraitPrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const originalImagePart = await fileToPart(originalImage);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [originalImagePart, { text: portraitPrompt }] },
    });
    return handleApiResponse(response, 'studio-portrait', originalImage);
};

export const generateImageFromText = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
    });
    if (response.generatedImages?.[0]?.image?.imageBytes) {
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error('No image was returned.');
};

export const generateWithThinkingMode = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 32768 } },
    });
    return response.text || 'No response returned.';
};
