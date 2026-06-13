# PROJECT_CONTEXT.md

---

## Project Name
**MediCore Platform** — Large-Scale Medical Content & Administration Platform

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (custom properties, modular) |
| Logic | JavaScript ES6+ (vanilla, modular) |
| Module System | ES6 native modules |
| Storage | LocalStorage / SessionStorage (frontend) |
| Backend Integration | REST API ready (fetch-based client) |
| Auth | Frontend-only (JWT-ready structure) |
| Build Tool | None (framework-free, CDN-free) |

---

## Architecture Style

- **MPA (Multi-Page Application)** with modular JS per page
- **Component-based** vanilla JS (class/function modules)
- **Data layer abstraction** via `api/` and `services/`
- **Unidirectional state** via lightweight `store/`
- **Guard-based routing** via `router/guards.js`
- **Backend-agnostic** — all API calls centralized in `src/api/`

---

## Folder Structure (Summary)

```
medical-platform/
├── assets/             # Static assets (fonts, icons, images)
├── styles/             # CSS: base, components, layout, pages
├── pages/              # HTML pages: home, articles, auth, admin
├── src/
│   ├── api/            # HTTP client + per-resource API modules
│   ├── components/     # Reusable UI components (common, articles, auth, admin)
│   ├── pages/          # Page-level JS controllers
│   ├── services/       # Auth, storage, validation logic
│   ├── store/          # App state management
│   ├── router/         # Client routing + auth guards
│   └── utils/          # DOM helpers, date, sanitize, misc
└── config/             # App config and constants
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files (JS components) | PascalCase | `ArticleCard.js` |
| Files (utilities/services) | camelCase | `auth.service.js` |
| Files (API modules) | kebab + `.api.js` | `articles.api.js` |
| HTML pages | `index.html` / `detail.html` | `pages/articles/detail.html` |
| CSS files | kebab-case | `article-card.css` |
| CSS variables | `--prefix-property` | `--color-primary` |
| JS classes | PascalCase | `class ArticleEditor {}` |
| JS functions/variables | camelCase | `fetchArticles()` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |

---

## Current Progress

- [x] Project architecture designed
- [x] Full folder & file structure defined
- [x] Project context documented
- [ ] Base CSS (reset, variables, typography)
- [ ] Layout system (grid, container)
- [ ] Common components (Navbar, Footer, Modal, Toast)
- [ ] Auth pages (Login, Register)
- [ ] Homepage
- [ ] Articles system (list, detail)
- [ ] Admin panel (dashboard, users, articles)
- [ ] API client & endpoint definitions
- [ ] State store implementation
- [ ] Router & auth guards
- [ ] Services (auth, storage, validation)

---

## Next Planned Steps

1. `styles/base/variables.css` — design tokens (colors, spacing, typography)
2. `styles/base/reset.css` — normalize + base reset
3. `styles/base/typography.css` — type scale and font rules
4. `src/utils/dom.js` — DOM utility helpers
5. `src/components/common/Navbar.js` — global navigation component
6. `pages/home/index.html` + `src/pages/Home.js` — homepage shell
7. `src/api/client.js` — base fetch client with interceptors
8. `src/services/auth.service.js` — token management & session logic
9. `src/router/index.js` + `guards.js` — page routing and protection
10. Auth pages — Login & Register forms with validation

---

## Notes

- All API calls must go through `src/api/client.js` — no direct fetch elsewhere
- No third-party libraries unless explicitly approved
- All user-generated content must pass through `src/utils/sanitize.js`
- Admin routes must be protected via `router/guards.js`
- CSS variables defined in `variables.css` are the single source of truth for the design system