
import { GoogleGenAI } from "@google/genai";
import { TrafficInsight } from "../types.ts";

export const fetchTrafficInsights = async (query: string): Promise<TrafficInsight> => {
  // Cek apakah API_KEY tersedia untuk mencegah crash di lingkungan statis murni
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return {
      summary: "Fitur Asisten AI memerlukan konfigurasi API Key. Saat ini menampilkan mode preview.",
      sources: [],
      timestamp: new Date().toLocaleTimeString('id-ID')
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan ringkasan singkat kondisi lalu lintas, kecelakaan, atau acara di area ${query}, Tangerang. Fokus pada data waktu nyata. Jawab dalam Bahasa Indonesia.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Informasi tidak tersedia saat ini.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title || "Sumber Berita",
        uri: c.web.uri
      }));

    return {
      summary: text,
      sources: sources,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.warn("Gemini Integration:", error);
    return {
      summary: "Tidak dapat memuat laporan lalu lintas cerdas saat ini. Silakan pantau melalui CCTV.",
      sources: [],
      timestamp: new Date().toLocaleTimeString('id-ID')
    };
  }
};
