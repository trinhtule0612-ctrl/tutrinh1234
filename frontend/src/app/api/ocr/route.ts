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
    Bạn là một trợ lý ảo chuyên trích xuất dữ liệu từ hình ảnh Căn cước công dân (CCCD) Việt Nam.
    Hãy đọc hình ảnh được cung cấp và trích xuất các thông tin sau, trả về chính xác định dạng JSON.
    Nếu có trường nào bị mờ hoặc không thể đọc được, hãy để chuỗi rỗng "".
    
    Các trường cần trích xuất:
    - full_name: Họ và tên của người đó (Lưu ý: Tên thường được viết in hoa. Có thể nằm ngay dưới chữ "Họ và tên / Full name:").
    - birth_date: Ngày tháng năm sinh (Định dạng DD/MM/YYYY).
    - address: Nơi thường trú hoặc Nơi cư trú (Place of residence). Vui lòng ghép tất cả các dòng của địa chỉ thành một dòng liền mạch cách nhau bởi dấu phẩy.
    - issue_date: Ngày cấp thẻ (Thường nằm ở mặt sau, hoặc nếu có ngày ở phía trên cùng bên trái của ảnh chân dung thì cũng là ngày cấp, hoặc ngày ở dòng dưới cùng. Định dạng DD/MM/YYYY).
    - issued_by: Nơi cấp (Cơ quan cấp, ví dụ: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội" hoặc "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"). Nếu không có ở mặt trước, hãy để "".
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
