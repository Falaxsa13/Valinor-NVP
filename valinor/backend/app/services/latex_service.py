from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_latex_from_text(content: str) -> str:
    """Generate LaTeX code from given text using OpenAI."""
    prompt = f"Convert this text to LaTeX: {content}"
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI that converts text to LaTeX."},
            {"role": "user", "content": prompt},
        ],
    )
    
    return response.choices[0].message.content.strip()