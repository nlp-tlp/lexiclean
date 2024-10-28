import axiosInstance from "./axiosInstance";

const endpointUrl = "https://api.openai.com/v1/chat/completions";

const promptStyleJSON =
  'You are an expert in fixing errors in text content. Only modify the words provided. Avoid additional words unless absolutely necessary. Do not add punctuation. Return words that do not need normalisation. Return the provided text in an array in JSON format. Here is an example: "tke it bck" should be returned as [["tke", "take"], ["it", "it"], ["bck", "back"]]';

const systemDirectiveMessage = {
  role: "system",
  content: promptStyleJSON,
};

const data = {
  model: "gpt-3.5-turbo-0125",
  temperature: 0.5,
  n: 1,
};

export const getGPTCorrection = async ({ text, openAIKey }) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
  };

  try {
    const response = await axiosInstance.post(
      endpointUrl,
      {
        ...data,
        messages: [
          systemDirectiveMessage,
          { role: "user", content: `Correct this text: ${text}` },
        ],
      },
      config
    );

    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices.length
    ) {
      throw new Error("Unexpected response format from OpenAI.");
    }
    const responseData = response.data.choices[0].message.content;
    return responseData !== "[]" ? responseData : null;
  } catch (error) {
    if (error.response) {
      // Handle HTTP errors
      if (error.response.status === 401) {
        throw new Error("Invalid API Key: Unable to authenticate with OpenAI.");
      } else {
        throw new Error(
          `OpenAI API Error: ${error.response.status} ${error.response.statusText}`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "The request was made but no response was received from OpenAI."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up request to OpenAI.");
    }
  }
};
