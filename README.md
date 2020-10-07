# Aurelia 1 scaffolding skeleton

![CI](https://github.com/aurelia/v1/workflows/CI/badge.svg) ![E2E-Linux](https://github.com/aurelia/v1/workflows/E2E-Linux/badge.svg) ![E2E-Windows](https://github.com/aurelia/v1/workflows/E2E-Windows/badge.svg) ![E2E-macOS](https://github.com/aurelia/v1/workflows/E2E-macOS/badge.svg)

The scaffolding repo for Aurelia 1 used by the [makes](https://makes.js.org) tool to create new Aurelia 1 projects.

Extracted from original aurelia-cli skeleton folder.

## Create an Aurelia 1 project

First, ensure that you have Node.js v10 or above installed on your system. Next, using [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b),
a tool distributed as part of Node.js, we'll create a new Aurelia 1 app. At a command prompt, run the following command:

```bash
npx makes aurelia/v1
```

This will cause `npx` to download the `makes` tool, along with the `aurelia/v1` scaffold from this repo, which it will use
to guide you through creating your project.

## Aurelia CLI

Aurelia CLI v2.0.0+ uses this repo to create new user app. When users run

```bash
au new
```

It calls `npx makes aurelia/v1` to perform the scaffolding.

## Test

Unit tests for various "makes" files.

```bash
npm test
```

## E2E Test

E2E tests for skeletons. Run 32 skeletons, very slow. GitHub Actions runs full E2E tests for every PR or push to master.

```bash
npm run test:e2e
```

When developing a new feature, better to check a subset of E2E tests locally.
```bash
npx cross-env TARGET_FEATURES=webpack,babel npm run test:e2e
```

When developing a new feature for [aurelia-cli](https://github.com/aurelia/cli), it's recommended to check against these E2E tests with targeted aurelia-cli master/branch/tag/commit.
```bash
npx cross-env TARGET_FEATURES=webpack,babel TARGET_CLI=aurelia/cli#branch npm run test:e2e
```

```bash
npx cross-env TARGET_FEATURES=webpack,babel TARGET_CLI=your-fork/cli#branch npm run test:e2e
```

## Local development

If you forked this repo, you can try your own skeleton with:

```bash
# Try some branch or commit or tag
npx makes your_GitHub_name/forked_repo_name#some-branch
```

## License

MIT.
