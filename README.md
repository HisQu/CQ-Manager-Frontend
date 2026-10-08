# CQ-Frontend

The repository containing the backend can be found here:
https://github.com/HerrMotz/Competency-Question-Manager-Backend

## Git Practices in this repository
We rely on backend compatibility. Therefore, we structure our branches in folders, where
the first layer is the name of the backend branch our branches are compatible with.

**For example:**
Our branch `feature-detail-view` which is compatible with the backend branch `add-comments`
will be named `backend-add-comments/feature-detail-view`. 

## Recommended Environment Setup

Put a `.env`-file in the frontend `src` directory.

```env
VITE_API_URL="http://localhost:8000"
```

### Building for production
- The application can be built using the Docker compose file. The built static website is exported to the host's `dist` 
   directory and can be deployed to a webserver directly.

```shell
docker-compose up
```

### Development
- For development, we recommend a Linux machine (or WSL for Windows Hosts)
- We do not recommend the usage of a Docker container for development purposes (because of overhead and resulting 
   reduction of performance, but also because of difficult handling)

To run the application in development mode (hot reloads)
```shell
npm run dev
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
- [JetBrains Webstorm](https://www.jetbrains.com/webstorm/) with configuration as described [here](https://vuejs.org/guide/typescript/overview.html).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Internationalization

The frontend supports English (`en`) and German (`de`) through Vue I18n. The language
selector is available on the landing page and every application page. The first
visit uses the first supported browser language, falling back to English. A user's
selection is saved in local storage as `cq-manager-locale` and also updates the
HTML `lang` attribute.

The term “Competency Questions” (singular “Competency Question”) remains in English
in every locale, including German.

Translations live in `src/locales/en.json` and `src/locales/de.json`. Add the same
message key to both files, then use `$t('key')` in templates or `useI18n()` in
component setup. Services and shared descriptors can import `t` from `src/i18n.ts`.
Use getters or computed values for translated labels so they update when the
language changes. Use named interpolation for complete sentences and Vue I18n
plural messages for counts; do not append English plural suffixes.

User-authored questions, names, comments, tags, and backend-provided validation
details retain their original text. Frontend messages and the built-in
uncatalogued label are translated. Exports use translated field headings while
preserving the underlying data.

Run `npm test`, `npx vue-tsc --noEmit`, and `npm run build` to validate changes.
The i18n tests check locale selection, persistence, dictionary parity, message
syntax, plural forms, and switching language without clearing form input.
