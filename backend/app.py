import io
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv

# Load env variables before importing gemini_ocr
load_dotenv()

# Import Gemini module
from gemini_ocr import extract_cccd_with_gemini

app = FastAPI(title="CCCD OCR API (Gemini Powered)")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OCRResponseData(BaseModel):
    full_name: str
    birth_date: str
    address: str
    issue_date: str
    issued_by: str

class OCRResponse(BaseModel):
    success: bool
    data: OCRResponseData

@app.get("/")
def read_root():
    return {"message": "CCCD OCR API (Gemini) is running"}

@app.post("/ocr", response_model=OCRResponse)
def process_ocr(image: UploadFile = File(...)):
    """
    Endpoint to process an uploaded image using Gemini API.
    """
    try:
        # 1. Read image file
        contents = image.file.read()
        try:
            img = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file format")
            
        # 2. Call Gemini API
        info = extract_cccd_with_gemini(img)
        
        return OCRResponse(
            success=True,
            data=OCRResponseData(**info)
        )
        
    except Exception as e:
        print(f"Server error: {e}")
        return OCRResponse(
            success=False,
            data=OCRResponseData(
                full_name="", birth_date="", address="", issue_date="", issued_by=""
            )
        )

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
