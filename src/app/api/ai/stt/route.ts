import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Auth check — always first
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Expect multipart form data with an "audio" file field
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  // Forward to OpenAI Whisper
  const whisperForm = new FormData();
  whisperForm.append("file", audioFile, "audio.webm");
  whisperForm.append("model", "whisper-1");
  whisperForm.append("language", "ro");
  // temperature=0 reduces hallucinations on unclear audio
  whisperForm.append("temperature", "0");
  // Prompt guides Whisper on expected content domain
  whisperForm.append(
    "prompt",
    "Studentul pune o întrebare despre lecția de programare sau inteligență artificială."
  );

  const openaiRes = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperForm,
    }
  );

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error("[/api/ai/stt] OpenAI error:", openaiRes.status, errText);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 502 }
    );
  }

  const result = (await openaiRes.json()) as { text: string };

  return NextResponse.json({ text: result.text });
}
