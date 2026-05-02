import axiosInstance from "@/lib/axiosInstance";

export interface ParsedBloodPostData {
    bloodGroup: string | null;
    bloodBags: number;
    reason: string;
    donationTimeType: "EMERGENCY" | "FIXED" | "FLEXIBLE";
    location: string | null;
    division: string | null;
    district: string | null;
    upazila: string | null;
    content: string;
}

export const parseBloodPostWithAI = async (text: string): Promise<ParsedBloodPostData> => {
    const response = await axiosInstance.post("/ai/parse-post", { text });
    return response.data.data;
};

export const chatWithAI = async (
    message: string,
    history: Array<{ role: string; content: string }>
): Promise<string> => {
    const response = await axiosInstance.post("/ai/chat", { message, history });
    return response.data.data.response;
};

export const getChatHistory = async (): Promise<Array<{ id: string; role: string; content: string; createdAt: string }>> => {
    const response = await axiosInstance.get("/ai/chat/history");
    return response.data.data;
};

export const clearChatHistory = async (): Promise<void> => {
    await axiosInstance.delete("/ai/chat/history");
};
