import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const prompt = `
    Bạn là một chuyên gia AI chuyên trích xuất dữ liệu từ hình ảnh Căn cước công dân (CCCD) hoặc Chứng minh nhân dân (CMND) của Việt Nam.
    Nhiệm vụ của bạn là đọc hình ảnh và trích xuất các thông tin dưới đây thành định dạng JSON.
    Nếu hình ảnh bị khuyết thông tin ở một trường nào đó (ví dụ: chụp mặt trước thì không có ngày cấp), hãy để chuỗi rỗng "".
    
    Các trường cần trích xuất:
    - full_name: Họ và tên của người đó (Lưu ý: Tên thường viết IN HOA, nằm ngay dưới chữ "Họ và tên / Full name:").
    - birth_date: Ngày tháng năm sinh (Định dạng DD/MM/YYYY).
    - address: Nơi thường trú / Nơi cư trú (Place of residence). Hãy lấy toàn bộ địa chỉ đầy đủ nhất có thể.
    - issue_date: Ngày cấp thẻ (Thường ghi là "Ngày, tháng, năm / Date, month, year:" ở mặt sau, hoặc dòng chữ ngày tháng ở dưới cùng của thẻ. Định dạng DD/MM/YYYY).
    - issued_by: Nơi cấp / Cơ quan cấp (Ví dụ: "Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội" hoặc "Cục Cảnh sát Quản lý hành chính về trật tự xã hội" ở mặt sau).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            prompt,
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: imageFile.type,
                }
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    full_name: { type: "STRING" },
                    birth_date: { type: "STRING" },
                    address: { type: "STRING" },
                    issue_date: { type: "STRING" },
                    issued_by: { type: "STRING" },
                },
                required: ["full_name", "birth_date", "address", "issue_date", "issued_by"]
            }
        }
    });

    if (response.text) {
        const resultText = response.text;
        const parsedData = JSON.parse(resultText);
        return NextResponse.json({
            success: true,
            data: parsedData
        });
    }

    throw new Error("Empty response from Gemini");

  } catch (error: any) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { success: false, data: { full_name: "", birth_date: "", address: "", issue_date: "", issued_by: "" } },
      { status: 500 }
    );
  }
}
