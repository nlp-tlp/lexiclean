"""Text utilities"""

import json

from openai import AsyncOpenAI, OpenAIError

# Constants
prompt_style_json = (
    "You are an expert in fixing errors in text content. Only modify the words provided. "
    "Avoid additional words unless absolutely necessary. Do not add punctuation. "
    "Return words that do not need normalisation. Return the provided text in an array in JSON format. "
    'Here is an example: "tke it bck" should be returned as [["tke", "take"], ["it", "it"], ["bck", "back"]]'
)
system_directive_message = {"role": "system", "content": prompt_style_json}


async def get_gpt_correction(text: str, openai_key: str) -> str:
    """Get GPT-3.5 correction for a given text"""
    client = AsyncOpenAI(api_key=openai_key)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.1,
            messages=[
                system_directive_message,
                {"role": "user", "content": f"Correct this text: {text}"},
            ],
        )
        if not response or not response.choices:
            raise ValueError("Unexpected response format from OpenAI.")
        message_content = response.choices[0].message.content
        return json.loads(message_content) if message_content != "[]" else None
    except OpenAIError as e:
        error_message = str(e)
        try:
            # Try to parse the error message as JSON
            error_dict = json.loads(error_message)
            if "error" in error_dict and "message" in error_dict["error"]:
                error_message = error_dict["error"]["message"]
        except json.JSONDecodeError:
            # If parsing fails, use the full error message
            pass
        raise OpenAIAPIException(error_message)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse OpenAI response as JSON")
    except Exception as e:
        raise ValueError(f"An unexpected error occurred: {str(e)}")


class OpenAIAPIException(Exception):
    """Custom exception for OpenAI API errors"""

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
