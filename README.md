# Secure Form Validator (Multi‑step, Responsive)

A secure‑focused, multi‑step signup form built with vanilla HTML, CSS, and JavaScript. Designed to demonstrate strong client‑side validation, accessibility, and security‑aware UI patterns.

Live demo: [YOUR_GITHUB_PAGES_URL]

## Features

- **Multi‑step form**  
  - Step 1: Account (email, password, confirm password)  
  - Step 2: Profile (full name, optional username)  
  - Step 3: Preferences (newsletter, terms acceptance)

- **Validation & security**  
  - Real‑time validation for email, password strength, matching passwords, name, username  
  - Dangerous pattern checks (e.g., `<script>`, `on*=` handlers, `javascript:`)  
  - Honeypot field to deter simple bots  
  - Rate‑limit simulation: after 3 failed submits, a cooldown timer appears

- **Password UX**  
  - Generate strong password button (14 chars, mixed character sets)  
  - Copy generated password to clipboard  
  - Show/hide password toggles for both password fields

- **Remember me**  
  - Option to remember email and username on the device using `localStorage`  
  - Values restored on page reload when enabled

- **Theme**  
  - Dark/light mode toggle  
  - Respects system preference (`prefers-color-scheme`)  
  - Theme persisted in `localStorage`

- **Accessibility**  
  - Keyboard navigable (Tab/Shift+Tab)  
  - Focus states and visible outlines  
  - ARIA live regions for step changes and status messages  
  - Semantic labels and error regions with `role="alert"`

- **Responsive design**  
  - Works from 320px wide phones up to large desktops  
  - Adjusted typography, spacing, and layouts via media queries

## Tech stack

- HTML5
- CSS3 (custom properties, responsive design)
- Vanilla JavaScript (ES6+)
- LocalStorage for theme + remember me

## How to run locally

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```
2. Open `index.html` in your browser.

No build tools or dependencies required.

## Deployment (GitHub Pages)

1. Create a new repository on GitHub (e.g. `secure-form-validator`).
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: secure form validator"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to repo **Settings → Pages**
   - Under **Source**, select `main` branch and `/ (root)`
   - Save
4. Your site will be available at:
   - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

Update the “Live demo” link at the top of this README with that URL.

## Security notes

- This is a **client‑side demo only**.  
- In production, all validation and sanitization must be repeated on the server.  
- Never trust client‑side checks for security‑critical logic.

## Possible extensions

- Wrap the form logic into a reusable JS module  
- Add backend integration (e.g., Node/Express, serverless functions)  
- Add more a11y tests (e.g., with screen readers)  
- Integrate into a larger portfolio or component library

## License

MIT

