
import { GoogleGenAI } from "@google/genai";
import { TrafficInsight } from "../types.ts";

// Helper to generate premium Indonesian mock traffic data when API Key is absent
export const getMockTrafficInsight = (region: string, queryType: string = 'kemacetan'): TrafficInsight => {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const isAll = region.toLowerCase().includes("raya") || region.toLowerCase().includes("semua");

  let summary = "";
  let sources: { title: string; uri: string }[] = [];

  if (queryType === 'banjir') {
    summary = `Berdasarkan pantauan sensor genangan air di wilayah ${region}, tidak terdeteksi adanya genangan air signifikan (Banjir nihil). Arus drainase perkotaan berfungsi normal dengan tinggi muka air sungai Cisadane terpantau di level aman/hijau. Beberapa titik historis genangan di bawah flyover atau jalur cekung dalam kondisi kering dan dapat dilalui kendaraan secara aman.`;
    sources = [
      { title: "BMKG Tangerang Live", uri: "https://www.bmkg.go.id" },
      { title: "BPBD Kabupaten Tangerang", uri: "https://bpbd.tangerangkab.go.id" }
    ];
  } else if (queryType === 'alternatif') {
    if (region.includes("Kota")) {
      summary = `Untuk menghindari antrean di Simpang Tugu Jam yang padat merayap, Anda dapat mengambil jalur alternatif via Jalan Veteran kemudian belok ke Jalan TMP Taruna. Pengendara dari arah Bandara Soekarno-Hatta menuju Puspem disarankan menggunakan Tol Lingkar Luar Barat untuk menghindari kepadatan di Jl. Pembangunan Raya.`;
    } else if (region.includes("Selatan")) {
      summary = `Kepadatan di sekitar German Center BSD dapat dihindari dengan menggunakan jalur alternatif Jl. Boulevard BSD Utama melewati area perumahan, atau memanfaatkan Tol Serpong-Cinere jika ingin mengarah ke Jakarta Selatan. Pengendara ke arah Bintaro disarankan menggunakan Jl. Boulevard Bintaro Jaya Sektor 7.`;
    } else if (region.includes("Kabupaten")) {
      summary = `Menghindari kepadatan di Gerbang Tol Bitung, pengendara disarankan keluar di Gerbang Tol Cikupa kemudian melanjutkan perjalanan melalui jalur arteri Jl. Raya Serang. Untuk wilayah Gading Serpong yang padat, silakan gunakan jalan pintas (shortcut) penghubung BSD-Gading Serpong melewati kawasan Medang.`;
    } else {
      summary = `Jalur alternatif Tangerang Raya: Hindari poros Jl. Raya Serang pada jam sibuk dengan memanfaatkan tol Jakarta-Tangerang. Pengendara motor dapat melintasi rute perumahan sekunder untuk menghindari persimpangan lampu merah utama yang mengalami siklus tunggu lampu lalu lintas yang panjang.`;
    }
    sources = [
      { title: "Dishub Tangerang Map", uri: "https://dishub.tangerangkota.go.id" },
      { title: "Peta Alternatif Kota Tangerang", uri: "https://tangerangkota.go.id" }
    ];
  } else {
    // Default or 'kemacetan'
    if (region.includes("Kota")) {
      summary = `Laporan Lalin ${region} (${timestamp} WIB): Lalu lintas merayap terpantau di sekitar Simpang Tugu Jam menuju arah Puspem Kota Tangerang karena volume kendaraan jam pulang kantor. Jalur kuliner Pasar Lama terpantau ramai namun lancar, kantong parkir jalan Kisamaun mulai terisi penuh. Kawasan Puspem terpantau ramai lancar tanpa ada hambatan berarti.`;
      sources = [
        { title: "Dishub Kota Tangerang Feed", uri: "https://dishub.tangerangkota.go.id" },
        { title: "Kanal Berita Tangerang Live", uri: "https://tangeranglive.tangerangkota.go.id" }
      ];
    } else if (region.includes("Selatan")) {
      summary = `Laporan Lalin ${region} (${timestamp} WIB): Terjadi perlambatan arus di Simpang German Center BSD City arah Tol Jakarta, ekor antrean terpantau sepanjang 250 meter. Kawasan Bintaro Exchange terpantau ramai lancar dengan antrean ringan di lampu merah utama. Bundaran Alam Sutera ramai lancar didominasi kendaraan roda empat.`;
      sources = [
        { title: "Tangerang Selatan Traffic Report", uri: "https://tangerangselatankota.go.id" },
        { title: "Infotangerang.id", uri: "https://infotangerang.id" }
      ];
    } else if (region.includes("Kabupaten")) {
      summary = `Laporan Lalin ${region} (${timestamp} WIB): Arus lalu lintas di Pintu Tol Bitung terpantau padat merayap didominasi oleh truk kontainer besar yang mengarah ke kawasan industri. Simpang Gading Serpong terpantau ramai padat di persimpangan lampu merah sekunder, arah Boulevard utama lancar terkendali.`;
      sources = [
        { title: "Dishub Kabupaten Tangerang", uri: "https://tangerangkab.go.id" },
        { title: "AboutTangerang News", uri: "https://abouttangerang.com" }
      ];
    } else {
      summary = `Laporan Lalin Tangerang Raya (${timestamp} WIB): Arus tol Jakarta-Tangerang terpantau padat di kedua arah terutama menjelang gerbang keluar Karang Tengah dan gerbang Tol Bitung. Jalur arteri utama seperti Jl. Raya Serang dan Jl. Daan Mogot mengalami kepadatan komuter rutin di beberapa titik persimpangan utama. Jalur alternatif dan kawasan wisata kuliner terpantau ramai kondusif.`;
      sources = [
        { title: "Jasa Marga Live Traffic", uri: "https://jasamarga.com" },
        { title: "Dishub Banten", uri: "https://dishub.bantenprov.go.id" }
      ];
    }
  }

  return {
    summary,
    sources,
    timestamp
  };
};

export const fetchTrafficInsights = async (query: string, queryType: string = 'kemacetan'): Promise<TrafficInsight> => {
  // Directly read from injected process.env strings
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    // Return detailed real-time simulator mock in Bahasa Indonesia
    return getMockTrafficInsight(query, queryType);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    let systemPrompt = `Berikan ringkasan singkat kondisi lalu lintas, titik kemacetan, atau acara penting di area ${query}, Tangerang. Fokus pada data waktu nyata. Jawab dalam Bahasa Indonesia secara ramah, profesional, dan informatif.`;
    if (queryType === 'alternatif') {
      systemPrompt = `Berikan rekomendasi jalur alternatif terbaik untuk menghindari kemacetan utama di wilayah ${query}, Tangerang. Jawab dalam Bahasa Indonesia secara ringkas, jelas, dan sebutkan nama-nama jalan alternatifnya.`;
    } else if (queryType === 'banjir') {
      systemPrompt = `Periksa apakah terdapat titik banjir, genangan air, atau kendala cuaca buruk yang memengaruhi lalu lintas di wilayah ${query}, Tangerang saat ini. Jika tidak ada, sebutkan bahwa kondisi aman dan tidak ada banjir. Jawab dalam Bahasa Indonesia.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use stable general model
      contents: systemPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Informasi lalu lintas tidak tersedia saat ini.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title || "Sumber Berita Lalin",
        uri: c.web.uri
      }));

    return {
      summary: text,
      sources: sources,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.warn("Gemini Integration Failed, using local simulation:", error);
    return getMockTrafficInsight(query, queryType);
  }
};
