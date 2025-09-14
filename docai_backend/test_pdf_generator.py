from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

def create_test_pdf():
    """Create a simple test PDF with some text content."""
    filename = "test_document.pdf"
    filepath = os.path.join("uploads", filename)

    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)

    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Page 1 content
    c.drawString(100, height - 100, "This is a test document for chunk extraction.")
    c.drawString(100, height - 120, "It contains multiple sentences and paragraphs.")
    c.drawString(100, height - 140, "The chunk extraction system should be able to split this text")
    c.drawString(100, height - 160, "into smaller chunks of approximately 500 words each.")
    c.drawString(100, height - 180, "This will help test the semantic chunking functionality.")
    c.drawString(100, height - 200, "The system uses word-based splitting with overlap.")
    c.drawString(100, height - 220, "Each chunk should contain meaningful text segments.")
    c.drawString(100, height - 240, "This is particularly important for RAG applications.")
    c.drawString(100, height - 260, "The chunks will be used to provide context to AI models.")
    c.drawString(100, height - 280, "Proper chunking improves retrieval accuracy.")
    c.drawString(100, height - 300, "This test document demonstrates the basic functionality.")

    # Add more content to create longer text
    for i in range(50):
        y_pos = height - 320 - (i * 20)
        if y_pos > 100:
            c.drawString(100, y_pos, f"Additional content line {i+1} for testing chunk extraction.")
            c.drawString(100, y_pos - 15, f"This line contains more text to increase the document length.")

    c.showPage()

    # Page 2 content
    c.drawString(100, height - 100, "This is the second page of the test document.")
    c.drawString(100, height - 120, "It demonstrates multi-page document processing.")
    c.drawString(100, height - 140, "The chunk extractor should handle multiple pages correctly.")
    c.drawString(100, height - 160, "Each page's content should be processed separately.")
    c.drawString(100, height - 180, "Then combined into appropriate chunks.")
    c.drawString(100, height - 200, "Page boundaries should be respected in chunk metadata.")

    c.save()
    print(f"Test PDF created: {filepath}")
    return filepath

if __name__ == "__main__":
    create_test_pdf()
