# Imaginarium · AI Image Generator

Imaginarium is a web-based AI art studio that transforms natural language prompts into vivid, downloadable images. The app is built with Next.js, Tailwind CSS, and the OpenAI Images API to offer fast, reliable image generation and a polished user experience that deploys seamlessly to Vercel.

## Features

- 🎨 Prompt-to-image generation powered by OpenAI’s `gpt-image-1` model
- ⚡ Responsive, real-time UI with generation feedback states
- 📐 Quick aspect ratio presets and smart prompt tips
- 💾 One-click download for the generated artwork (served as PNG)
- 🌗 Fully responsive layout with atmospheric, glassmorphism-inspired design

## Prerequisites

- Node.js 18 or newer
- An OpenAI API key with access to the Images API

Create a `.env.local` file at the project root and add:

```env
OPENAI_API_KEY=sk-...
```

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start creating prompts. Image downloads happen directly in your browser once a generation completes.

## Production Build

```bash
npm run build
npm start
```

## Testing & Quality

- `npm run lint` — run ESLint with Next.js’ recommended config

## Deployment

The project is optimized for Vercel. When deploying, be sure to configure the `OPENAI_API_KEY` environment variable within your Vercel project settings.

```bash
vercel deploy --prod
```

## License

MIT © Imaginarium Team
