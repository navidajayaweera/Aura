
import { GoogleGenAI, Type } from "@google/genai";
import { AuraResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Aura, a friendly and proactive personal assistant. Your goal is to help users remember everything they need for an event, trip, or task by creating a categorized checklist.

Instructions:
1.  Analyze the user's request to understand the activity (e.g., grocery shopping, beach trip, business travel) and any specific items they mention.
2.  You have the ability to check the weather. Based on the user's stated location and date (or assuming 'tomorrow' in the user's local area if not specified), provide a brief weather forecast, including the temperature in Celsius (e.g., '22°C'), and suggest relevant items (e.g., 'umbrella for rain', 'sunscreen for sun'). If no location is mentioned, you can make a general suggestion or politely note you couldn't check without a location.
3.  Based on the activity, proactively suggest 1-3 commonly forgotten but essential items. For a trip, suggest 'phone charger' or 'passport'; for shopping, suggest 'reusable bags'; for a workout, suggest 'water bottle'.
4.  You MUST format your entire response as a single, valid JSON object, with no text before or after it. Adhere strictly to the provided response schema.
5.  Keep your language conversational, helpful, and friendly.`;

const auraResponseSchema = {
  type: Type.OBJECT,
  properties: {
    greeting: {
      type: Type.STRING,
      description: "A friendly, conversational opening remark to the user.",
    },
    weather: {
      type: Type.OBJECT,
      description: "Information about the weather and related items.",
      properties: {
        summary: {
          type: Type.STRING,
          description: "A brief summary of the weather forecast. Can be an empty string if location is unknown.",
        },
        temperature: {
            type: Type.STRING,
            description: "The forecasted temperature in Celsius (e.g., '22°C'). Can be an empty string if not available.",
        },
        items: {
          type: Type.ARRAY,
          description: "A list of suggested items based on the weather forecast.",
          items: { type: Type.STRING },
        },
      },
    },
    checklist: {
      type: Type.ARRAY,
      description: "An array of categorized lists of items the user needs.",
      items: {
        type: Type.OBJECT,
        required: ["category", "items"],
        properties: {
          category: {
            type: Type.STRING,
            description: "The name of the category (e.g., 'Groceries', 'Clothing', 'Documents').",
          },
          items: {
            type: Type.ARRAY,
            description: "The list of items within this category.",
            items: { type: Type.STRING },
          },
        },
      },
    },
    suggestions: {
      type: Type.ARRAY,
      description: "A list of proactively suggested, commonly forgotten items.",
      items: { type: Type.STRING },
    },
    closing: {
      type: Type.STRING,
      description: "A polite closing remark, often asking if there's anything else needed.",
    },
  },
  required: ["greeting", "weather", "checklist", "suggestions", "closing"],
};


export const generateChecklist = async (prompt: string): Promise<AuraResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: auraResponseSchema,
                temperature: 0.7
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as AuraResponse;
        return parsedData;

    } catch (error) {
        console.error("Error generating checklist:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get a response from Aura. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with Aura.");
    }
};
