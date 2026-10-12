# CQ-Frontend

The repository containing the backend can be found here:
https://github.com/HisQu/CQ-Manager-Backend

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
