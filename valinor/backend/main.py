from fastapi import FastAPI
from pydantic import BaseModel
import openai
from openai import OpenAI


app = FastAPI()

client = OpenAI(
    api_key="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"
)


class TextRequest(BaseModel):
    content: str


@app.post("/generate-latex")
def generate_latex(request: TextRequest):

    prompt = f"Convert the following text into LaTeX:\n\n{request.content}"

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in LaTeX formatting."},
            {"role": "user", "content": prompt},
        ],
    )

    return {"latex": response.choices[0].message.content}
