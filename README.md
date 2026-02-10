<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1AqUWWVjEnbFDCGd15PYJpOWmtoLO4P4C

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Implantação na Vercel

1. Envie seu código para um repositório Git (GitHub, GitLab, Bitbucket).
2. Importe o projeto no Vercel.
3. Adicione as seguintes **Variáveis de Ambiente** nas Configurações do Projeto:
   - `GEMINI_API_KEY`: Sua Chave de API do Google Gemini.
   - `VITE_SUPABASE_URL`: A URL do seu Projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: A Chave de API (Anon) do seu Projeto Supabase.
4. Faça o Deploy!

