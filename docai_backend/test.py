from transformers import MarianMTModel, MarianTokenizer

tok = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-hi")
mdl = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-hi")

text = "Hello, how are you?"
inputs = tok(text, return_tensors="pt", truncation=True)
outputs = mdl.generate(**inputs)
print(tok.decode(outputs[0], skip_special_tokens=True))