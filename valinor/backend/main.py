from fastapi import FastAPI
from pydantic import BaseModel
import openai
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key="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"
)


class TextRequest(BaseModel):
    content: str


@app.post("/generate-latex")
def generate_latex(request: TextRequest):

    prompt = f"""
    Convert the following text into LaTeX **ONLY**. 
    Do not include explanations or additional comments. 
    Return only valid LaTeX code that can be compiled directly.

    Text: {request.content}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that strictly converts text into LaTeX without explanations.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    return {"latex": response.choices[0].message.content.strip()}
