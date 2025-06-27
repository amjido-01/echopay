"use server";

import OpenAI, { toFile } from "openai";
import { setTimeout } from "timers/promises";

const openai = new OpenAI();

export async function speechToText(base64Audio: string) {
  try {
    const buffer = Buffer.from(base64Audio, "base64");
    const file = await toFile(buffer, "audio.webm");

    const controller = new AbortController();
    const timeout = setTimeout(15000).then(() => controller.abort());

    const result = await openai.audio.transcriptions.create(
      {
        file,
        model: "whisper-1",
      },
      { signal: controller.signal }
    );
    clearTimeout(timeout as any);
    return result.text;
  } catch (error) {
    console.error("STT failed", error);
    return "";
  }
}
