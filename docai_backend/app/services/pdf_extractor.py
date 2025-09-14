from typing import Dict, List
from pathlib import Path
import tempfile
import logging

log = logging.getLogger(__name__)

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except Exception:
    HAS_FITZ = False

try:
    import pytesseract
    from PIL import Image
    HAS_PYTESSERACT = True
except Exception:
    HAS_PYTESSERACT = False

try:
    import easyocr
    HAS_EASYOCR = True
except Exception:
    HAS_EASYOCR = False


class PDFExtractor:
    """Extract text from PDF using a cascade: PyMuPDF -> Tesseract -> EasyOCR.

    Returns dict: {"method": str, "page_count": int, "pages": List[str]}
    """

    def __init__(self):
        log.info("PDFExtractor initialized with available libraries:")
        log.info(f"PyMuPDF: {HAS_FITZ}")
        log.info(f"Tesseract: {HAS_PYTESSERACT}")
        log.info(f"EasyOCR: {HAS_EASYOCR}")

    def extract(self, pdf_path: Path) -> Dict:
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        log.info(f"Starting text extraction for: {pdf_path.name}")

        # Try PyMuPDF first
        if HAS_FITZ:
            try:
                log.info("Attempting PyMuPDF extraction...")
                pages = self._extract_with_pymupdf(pdf_path)
                if any(pages) and any(text.strip() for text in pages):
                    log.info(f"PyMuPDF extraction successful, extracted {len(pages)} pages")
                    return {"method": "pymupdf", "page_count": len(pages), "pages": pages}
                else:
                    log.warning("PyMuPDF extracted empty or no text, trying fallback...")
            except Exception as e:
                log.exception("PyMuPDF extraction failed: %s", e)

        # Fallback to Tesseract OCR
        if HAS_PYTESSERACT:
            try:
                log.info("Attempting Tesseract OCR extraction...")
                pages = self._extract_with_tesseract(pdf_path)
                if any(pages) and any(text.strip() for text in pages):
                    log.info(f"Tesseract extraction successful, extracted {len(pages)} pages")
                    return {"method": "tesseract", "page_count": len(pages), "pages": pages}
                else:
                    log.warning("Tesseract extracted empty or no text, trying fallback...")
            except Exception as e:
                log.exception("Tesseract extraction failed: %s", e)

        # Fallback to EasyOCR
        if HAS_EASYOCR:
            try:
                log.info("Attempting EasyOCR extraction...")
                pages = self._extract_with_easyocr(pdf_path)
                if any(pages) and any(text.strip() for text in pages):
                    log.info(f"EasyOCR extraction successful, extracted {len(pages)} pages")
                    return {"method": "easyocr", "page_count": len(pages), "pages": pages}
                else:
                    log.warning("EasyOCR extracted empty or no text")
            except Exception as e:
                log.exception("EasyOCR extraction failed: %s", e)

        # If nothing worked, return empty pages
        log.error("All extraction methods failed for: %s", pdf_path.name)
        return {"method": "none", "page_count": 0, "pages": []}

    def _extract_with_pymupdf(self, pdf_path: Path) -> List[str]:
        doc = fitz.open(str(pdf_path))
        pages = []
        for page in doc:
            try:
                text = page.get_text().strip()
                pages.append(text)
            except Exception:
                pages.append("")
        doc.close()
        return pages

    def _extract_with_tesseract(self, pdf_path: Path) -> List[str]:
        # Render each page to image and run pytesseract.image_to_string
        pages = []
        doc = fitz.open(str(pdf_path)) if HAS_FITZ else None
        for i in range(doc.page_count if doc else 0):
            pix = doc.load_page(i).get_pixmap(dpi=300)
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                pix.save(tmp.name)
                try:
                    img = Image.open(tmp.name)
                    text = pytesseract.image_to_string(img)
                    pages.append(text.strip())
                except Exception:
                    pages.append("")
        if doc:
            doc.close()
        return pages

    def _extract_with_easyocr(self, pdf_path: Path) -> List[str]:
        # Use fitz to render pages to images, then run easyocr.Reader
        pages = []
        reader = easyocr.Reader(["en"])  # languages can be extended later
        doc = fitz.open(str(pdf_path)) if HAS_FITZ else None
        for i in range(doc.page_count if doc else 0):
            pix = doc.load_page(i).get_pixmap(dpi=300)
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                pix.save(tmp.name)
                try:
                    result = reader.readtext(tmp.name, detail=0)
                    pages.append("\n".join(result))
                except Exception:
                    pages.append("")
        if doc:
            doc.close()
        return pages
