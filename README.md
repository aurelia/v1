# Aurelia 1 scaffolding skeleton

[![Build Status](https://travis-ci.com/aurelia/au1.svg?branch=master)](https://travis-ci.com/aurelia/au1)

_Work In Progress_

The scaffolding repo for Aurelia 1 used by the [makes](https://makes.js.org) tool to create new Aurelia 1 projects.

## Create an Aurelia 1 project

First, ensure that you have Node.js v8.9.0 or above installed on your system. Next, using [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b),
a tool distributed as part of Node.js, we'll create a new Aurelia 1 app. At a command prompt, run the following command:

```bash
npx makes aurelia/au1
```

This will cause `npx` to download the `makes` tool, along with the `aurelia/au1` scaffold from this repo, which it will use
to guide you through creating your project.

## Aurelia CLI

Aurelia CLI v2.0.0+ uses this repo to create new user app. When users run

```bash
au1 new
```

It calls `npx makes aurelia/au1` to perform the scaffolding.

## Status

Note ready. Converting aurelia-cli inner skeleton to here...


## License

MIT.
