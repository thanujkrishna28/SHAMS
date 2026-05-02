import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Generate a smart room recommendation based on preferences and room stats
 */
export const generateRoomRecommendation = async (
    preferences: any,
    availableRooms: any[]
): Promise<string> => {
    if (!genAI) return 'AI Recommendation unavailable (Missing API Key)';

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are a smart hostel room allocation assistant.
        A student is looking for a room.
        Their preferences: ${JSON.stringify(preferences)}
        Available rooms: ${JSON.stringify(availableRooms.slice(0, 5).map(r => ({ block: r.block?.name, roomNumber: r.roomNumber, type: r.type, floor: r.floor, capacity: r.capacity, occupants: r.occupants?.length })))}
        
        Generate a single short sentence recommending the best room from the available rooms based on their preferences, and a brief reason why.
        Format exactly like this (don't include anything else):
        "Recommended: Block [BlockName]-[RoomNumber] ([Brief reason, e.g., Low occupancy, matches preference])"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('AI Room Recommendation Error:', error);
        return 'Could not generate recommendation at this time.';
    }
};

/**
 * Generate a smart notification message using AI (Hybrid Model)
 */
export const generateSmartNotification = async (
    contextStr: string,
    baseMessage: string
): Promise<string> => {
    if (!genAI) return baseMessage;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are a helpful AI assistant for a hostel management system.
        I have a system notification that needs to be sent to a user.
        Context/Title: ${contextStr}
        Base Message: ${baseMessage}
        
        Generate a very short, friendly 1-sentence tip, context, or reassurance that complements this notification.
        Example for a delayed complaint: "We know waiting is tough, but we are on it."
        Example for a leave approval: "Have a safe trip and enjoy your time!"
        Do NOT repeat the base message. Just provide the short AI enhancement (max 10 words). Do not use quotes.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiEnhancement = response.text().trim();
        
        // Return hybrid notification (System Message + AI Context)
        return `${baseMessage} \n\n✨ ${aiEnhancement}`;
    } catch (error) {
        console.error('AI Smart Notification Error:', error);
        return baseMessage; // Fallback to base
    }
};

/**
 * AI Complaint Intelligence: Auto-classify, prioritize, and suggest resolutions
 */
export const analyzeComplaint = async (
    title: string,
    description: string
): Promise<{ category: string, priority: string, resolutionSteps: string } | null> => {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are an AI Hostel Manager. A student submitted a complaint.
        Title: "${title}"
        Description: "${description}"
        
        Analyze this complaint and return ONLY a valid JSON object with the following keys:
        - "category": One of ["maintenance", "cleanliness", "electrical", "plumbing", "other"]
        - "priority": One of ["low", "medium", "high"]. (e.g. water leaks, electricity issues, safety = high)
        - "resolutionSteps": A short string with 2-3 brief steps for the warden to resolve this issue.
        
        Output strictly JSON without markdown blocks or formatting. Example:
        {"category": "electrical", "priority": "high", "resolutionSteps": "1. Dispatch electrician. 2. Verify main breaker."}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Strip out any potential markdown like \`\`\`json
        const jsonStr = text.replace(/^\s*```json/m, '').replace(/```\s*$/m, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Complaint Analysis Error:', error);
        return null;
    }
};
