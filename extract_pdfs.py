import sys
from pypdf import PdfReader
files = [
    r"c:\project\kora-store\Assignment One - Computing Group Project AY2025-26.pdf",
    r"c:\project\kora-store\Computing Group Project Assessment 1 Case Study.pdf"
]

for file in files:
    try:
        reader = PdfReader(file)
        text = f"--- TEXT FROM {file} ---\n"
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(file + ".txt", "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Successfully extracted {file}")
    except Exception as e:
        print(f"Failed to extract {file}: {e}")
