# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Supabase Authentication

This project now uses [Supabase](https://supabase.com/) for user authentication. Before running the frontend you must provide your Supabase project details using Vite environment variables.

1. Create a `.env` file in `src/frontend` (or at the repo root) with the following keys:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
   *You can find both values in your Supabase dashboard under Settings → API.*

2. Install the library:
   ```bash
   cd src/frontend
   npm install @supabase/supabase-js
   ```

3. Start the development server as usual (`npm run dev`) and open the app at `http://localhost:5173`.

The authentication flow supports email/password sign‑up + sign‑in as well as Google OAuth. All user metadata is kept in localStorage for the app’s existing profile logic.

---

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
