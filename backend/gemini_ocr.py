import os
import json
import logging
from PIL import Image
from google import genai
from google.genai import types

# Load API key from env
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    logging.warning("GEMINI_API_KEY is not set. Gemini OCR will not work.")

# Initialize the Gemini client
try:
    client = genai.Client(api_key=API_KEY)
except Exception as e:
    logging.error(f"Failed to initialize Gemini Client: {e}")
    client = None

def extract_cccd_with_gemini(image: Image.Image) -> dict:
    """
    Sends the CCCD image to Gemini API and returns extracted information as a dictionary.
    """
    if not client:
        raise ValueError("Gemini Client is not initialized. Please check GEMINI_API_KEY.")
    
    prompt = """
    Bạn là một trợ lý ảo chuyên trích xuất dữ liệu từ hình ảnh Căn cước công dân (CCCD) Việt Nam.
    Hãy đọc hình ảnh được cung cấp và trích xuất các thông tin sau, trả về chính xác định dạng JSON.
    Nếu có trường nào bị mờ hoặc không thể đọc được, hãy để chuỗi rỗng "".
    
    Các trường cần trích xuất:
    - full_name: Họ và tên của người đó (Lưu ý: Tên thường được viết in hoa. Có thể nằm ngay dưới chữ "Họ và tên / Full name:").
    - birth_date: Ngày tháng năm sinh (Định dạng DD/MM/YYYY).
    - address: Nơi thường trú hoặc Nơi cư trú (Place of residence). Vui lòng ghép tất cả các dòng của địa chỉ thành một dòng liền mạch cách nhau bởi dấu phẩy.
    - issue_date: Ngày cấp thẻ (Thường nằm ở mặt sau, hoặc nếu có ngày ở phía trên cùng bên trái của ảnh chân dung thì cũng là ngày cấp, hoặc ngày ở dòng dưới cùng. Định dạng DD/MM/YYYY).
    - issued_by: Nơi cấp (Cơ quan cấp, ví dụ: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội" hoặc "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội"). Nếu không có ở mặt trước, hãy để "".
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "full_name": types.Schema(type=types.Type.STRING),
                        "birth_date": types.Schema(type=types.Type.STRING),
                        "address": types.Schema(type=types.Type.STRING),
                        "issue_date": types.Schema(type=types.Type.STRING),
                        "issued_by": types.Schema(type=types.Type.STRING),
                    },
                    required=["full_name", "birth_date", "address", "issue_date", "issued_by"]
                )
            )
        )
        
        # Parse the JSON response
        text_res = response.text
        data = json.loads(text_res)
        
        # Cleanup
        for key in data:
            if isinstance(data[key], str):
                data[key] = data[key].strip()
                
        return data
        
    except Exception as e:
        logging.error(f"Gemini API Error: {e}")
        return {
            "full_name": "",
            "birth_date": "",
            "address": "",
            "issue_date": "",
            "issued_by": ""
        }
