"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import Image from "next/image";

type GenerationState = "idle" | "loading" | "success" | "error";
type ImageSize = "256x256" | "512x512" | "1024x1024";

const sizeOptions: { label: string; value: ImageSize }[] = [
  { label: "Large (1024×1024)", value: "1024x1024" },
  { label: "Medium (512×512)", value: "512x512" },
  { label: "Compact (256×256)", value: "256x256" },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>(sizeOptions[0]?.value ?? "1024x1024");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationState>("idle");

  const canSubmit = useMemo(() => prompt.trim().length > 3 && status !== "loading", [prompt, status]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSubmit) {
        return;
      }

      setStatus("loading");
      setError(null);
      setImageUrl(null);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, size }),
        });

        const payload = (await response.json()) as {
          imageUrl?: string;
          error?: string;
        };

        if (!response.ok || !payload.imageUrl) {
          throw new Error(payload.error ?? "Failed to generate image.");
        }

        setImageUrl(payload.imageUrl);
        setStatus("success");
      } catch (generationError) {
        const message =
          generationError instanceof Error
            ? generationError.message
            : "Something went wrong while generating the image.";
        setError(message);
        setStatus("error");
      }
    },
    [canSubmit, prompt, size],
  );

  const handleDownload = useCallback(() => {
    if (!imageUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = `${prompt.trim().replace(/\s+/g, "-").slice(0, 64) || "ai-image"}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [imageUrl, prompt]);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
        <div className="absolute -left-80 top-10 h-96 w-96 rounded-full bg-purple-500 blur-[160px]" />
        <div className="absolute -right-40 top-32 h-[28rem] w-[28rem] rounded-full bg-sky-500 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-indigo-400 blur-[180px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-4">
          <p className="max-w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            Dream something new
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Imaginarium
          </h1>
          <p className="max-w-2xl text-lg text-white/70 sm:text-xl">
            Turn your wildest ideas into vivid imagery. Describe the scene, pick a
            format, and let our AI do the rest—no design experience required.
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="prompt" className="text-sm font-medium text-white/80">
                Describe your image
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={5}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="A photo of a neon-lit futuristic city with flying cars at dusk"
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-white/80">Aspect ratio</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {sizeOptions.map((option) => {
                  const isSelected = option.value === size;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSize(option.value)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-sky-400 bg-sky-400/20 text-white"
                          : "border-white/10 bg-black/30 text-white/70 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/30 disabled:text-slate-300/60"
            >
              {status === "loading" ? (
                <>
                  <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-b-transparent" />
                  Generating...
                </>
              ) : (
                <>Create image</>
              )}
            </button>

            {error && (
              <p className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <p className="text-xs text-white/50">
              Tip: Be as descriptive as possible. Mention the art style, lighting,
              camera angle, and mood for best results.
            </p>
          </form>

          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-lg">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/10 to-white/5">
              {status === "loading" && (
                <div className="flex h-full items-center justify-center gap-3 text-white/70">
                  <span className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-b-transparent" />
                  Crafting your vision...
                </div>
              )}
              {status !== "loading" && imageUrl && (
                <Image
                  src={imageUrl}
                  alt={prompt.trim() || "AI generated artwork"}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
              )}
              {status === "idle" && !imageUrl && (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white/50">
                  <span className="text-4xl">✨</span>
                  <p className="text-sm">
                    Your generated masterpiece will appear here. Share your most
                    imaginative prompt to get started.
                  </p>
                </div>
              )}
              {status === "error" && !imageUrl && (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-rose-100">
                  Unable to render the image. Adjust your prompt or try again in a
                  moment.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-widest">
                One-click download
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-widest">
                Unlimited iterations
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-widest">
                Instant results
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!imageUrl}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/30"
              >
                Download image
              </button>
              <p className="text-xs text-white/40">
                Downloads are served directly in your browser. Save and share your
                creations anywhere you like.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/40 py-6 text-center text-xs text-white/40 backdrop-blur">
        Built with ❤️ using Next.js, Tailwind CSS, and the OpenAI Images API.
      </footer>
    </div>
  );
}
