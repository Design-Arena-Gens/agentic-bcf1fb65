import { NextRequest, NextResponse } from "next/server";

type GenerateRequestBody = {
  prompt?: string;
  size?: "256x256" | "512x512" | "1024x1024";
};

type OpenAIImageGenerationResponse = {
  data?: { b64_json?: string }[];
  error?: { message?: string };
};

const OPENAI_API_URL = "https://api.openai.com/v1/images/generations";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY env var is not configured." },
      { status: 500 },
    );
  }

  let body: GenerateRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "Please provide a prompt to generate an image." },
      { status: 400 },
    );
  }

  const size = body.size ?? "1024x1024";

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size,
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json()) as OpenAIImageGenerationResponse;
      const message =
        errorBody.error?.message ??
        `Image generation request failed with status ${response.status}.`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const result = (await response.json()) as OpenAIImageGenerationResponse;
    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "The AI service returned an empty response." },
        { status: 502 },
      );
    }

    const dataUrl = `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred.";
    return NextResponse.json(
      { error: `Unable to generate image right now: ${message}` },
      { status: 500 },
    );
  }
}
