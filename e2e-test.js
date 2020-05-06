// This test is not required by "makes" at all.
// It's to ensure all the skeletons here do (kind of) work.
// The whole test suite takes long long time to finish,
// it's not automatically triggered by "npm version patch".
// Have to run "npm run test:e2e" manually before a release.

const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const del = require('del');
const test = require('ava');
const puppeteer = require('puppeteer');
const kill = require('tree-kill');

const dir = __dirname;

const folder = path.join(dir, 'test-skeletons');
console.log('-- cleanup ' + folder);
del.sync(folder);
fs.mkdirSync(folder);

// Somehow taskkill on windows would not send SIGTERM signal to proc,
// The proc killed by taskkill got null signal.
const win32Killed = new Set();
function killProc(proc) {
  if (process.platform === 'win32') {
    win32Killed.add(proc.pid);
  }
  proc.stdin.pause();
  kill(proc.pid);
}


function run(command, dataCB, errorCB) {
  const [cmd, ...args] = command.split(' ');
  return new Promise((resolve, reject) => {
    const env = Object.create(process.env);
    // use CI to turn off automatic browser opening in tasks/run.js
    env.CI = 'true';
    // need to reset NODE_ENV back to development because this whole
    // test is running in NODE_ENV=test which will affect gulp build
    env.NODE_ENV = 'development';
    const proc = spawn(cmd, args, {env});
    proc.on('exit', (code, signal) => {
      if (code && signal !== 'SIGTERM' && !win32Killed.has(proc.pid)) {
        reject(new Error(cmd + ' ' + args.join(' ') + ' process exit code: ' + code + ' signal: ' + signal));
      } else {
        resolve();
      }
    });
    proc.on('error', reject);
    proc.stdout.on('data', data => {
      process.stdout.write(data);
      if (dataCB) {
        dataCB(data, () => {
          console.log(`-- kill "${command}"`);
          killProc(proc);
        });
      }
    });
    proc.stderr.on('data', data => {
      process.stderr.write(data);
      if (errorCB) {
        errorCB(data, () => {
          console.log(`-- kill "${command}"`);
          // process.stderr.write(data);
          killProc(proc);
        });
      }
    })
  });
}

async function takeScreenshot(url, filePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await new Promise(r => setTimeout(r, 6000));
  await page.screenshot({path: filePath});
  await browser.close();
}

const targetCLI = (process.env.TARGET_CLI || null);

const targetFeatures = (process.env.TARGET_FEATURES || '').toLowerCase().split(',').filter(p => p);
if (targetFeatures.length) {
  console.log('Target features: ', targetFeatures);
}

function patchPackageJson(appFolder, targetCLI) {
  if (!targetCLI) return;
  const packageJsonPath = path.join(appFolder, 'package.json');
  const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    .replace(/"aurelia-cli": "(.+?)"/, '"aurelia-cli": "' + targetCLI + '"');
  console.log('-- patch package.json to use "aurelia-cli": "' + targetCLI + '"');
  fs.writeFileSync(packageJsonPath, packageJson);
}

function getServerRegex(features) {
  if (features.includes('webpack')) return /Project is running at (\S+)/;
  return /Application Available At: (\S+)/;
}

// The 72 skeletons copied from aurelia-cli.
// This does not cover all possible combinations.
const skeletons = [
  'cli-bundler requirejs babel stylus jest dotnet-core cypress scaffold-navigation',
  'cli-bundler requirejs babel htmlmin-max jest cypress',
  'cli-bundler requirejs babel htmlmin-min karma dotnet-core cypress scaffold-navigation',
  'cli-bundler requirejs babel less htmlmin-min postcss-basic karma cypress scaffold-navigation',
  'cli-bundler requirejs typescript jest dotnet-core cypress',
  'cli-bundler requirejs typescript jest cypress',
  'cli-bundler requirejs typescript karma dotnet-core cypress scaffold-navigation vscode',
  'cli-bundler requirejs sass htmlmin-max typescript karma cypress',

  'cli-bundler alameda babel jest dotnet-core cypress',
  'cli-bundler alameda babel jest cypress',
  'cli-bundler alameda babel sass karma dotnet-core cypress',
  'cli-bundler alameda babel karma cypress scaffold-navigation',
  'cli-bundler alameda stylus typescript jest dotnet-core cypress',
  'cli-bundler alameda less postcss-basic typescript jest cypress',
  'cli-bundler alameda htmlmin-min typescript karma dotnet-core cypress',
  'cli-bundler alameda htmlmin-min typescript karma cypress',

  'cli-bundler systemjs babel jest dotnet-core cypress',
  'cli-bundler systemjs babel jest cypress',
  'cli-bundler systemjs babel stylus karma dotnet-core cypress scaffold-navigation',
  'cli-bundler systemjs babel sass karma postcss-typical cypress',
  'cli-bundler systemjs typescript jest dotnet-core cypress',
  'cli-bundler systemjs htmlmin-max typescript jest cypress',
  'cli-bundler systemjs less htmlmin-max typescript karma dotnet-core cypress',
  'cli-bundler systemjs typescript karma cypress',

  'webpack http1 babel stylus jest postcss-basic dotnet-core cypress',
  'webpack http1 babel htmlmin-max jest cypress',
  'webpack http1 babel less karma dotnet-core cypress scaffold-navigation',
  'webpack http1 babel htmlmin-min karma cypress',
  'webpack http1 typescript jest dotnet-core cypress',
  'webpack http2 htmlmin-max typescript jest cypress scaffold-navigation',
  'webpack http2 sass typescript postcss-typical karma dotnet-core cypress scaffold-navigation vscode',
  'webpack http1 htmlmin-min typescript karma cypress',

  'plugin cli-bundler requirejs babel stylus htmlmin-min jest',
  'plugin cli-bundler requirejs babel karma postcss-typical vscode',
  'plugin cli-bundler requirejs htmlmin-max typescript jest',
  'plugin cli-bundler requirejs typescript karma plugin-scaffold-basic',

  'plugin cli-bundler requirejs babel htmlmin-max jest',
  'plugin cli-bundler requirejs babel less htmlmin-min postcss-basic karma plugin-scaffold-basic',
  'plugin cli-bundler requirejs typescript jest',
  'plugin cli-bundler requirejs sass htmlmin-max typescript karma'
]
.map(s => s.split(' '))
.filter(features =>
  targetFeatures.length === 0 || targetFeatures.every(f => features.includes(f))
);

skeletons.forEach((features, i) => {
  const appName = features.join('-');
  const appFolder = path.join(folder, appName);
  const title = `App: ${i + 1}/${skeletons.length} ${appName}`;
  const serverRegex = getServerRegex(features);

  test.serial(title, async t => {
    console.log(title);
    process.chdir(folder);

    const makeCmd = `npx makes ${dir} ${appName} -s ${features.join(',')}`;
    console.log('-- ' + makeCmd);
    await run(makeCmd);
    t.pass('made skeleton');
    process.chdir(appFolder);

    patchPackageJson(appFolder, targetCLI);

    console.log('-- yarn');
    await run('yarn');
    t.pass('installed deps');

    console.log('-- npm test');
    await run('npm test');
    t.pass('finished unit tests');

    console.log('-- npx au generate attribute NewThing');
    await run('npx au generate attribute NewThing', null,
      (data, kill) => {
        t.fail('au generate attribute failed: ' + data.toString());
      }
    );
    t.pass('generated attribute');

    console.log('-- npx au generate component NewThing .');
    await run('npx au generate component NewThing .', null,
      (data, kill) => {
        t.fail('au generate component failed: ' + data.toString());
      }
    );
    t.pass('generated component');

    console.log('-- npx au generate element NewThing');
    await run('npx au generate element NewThing', null,
      (data, kill) => {
        t.fail('au generate element failed: ' + data.toString());
      }
    );
    t.pass('generated element');

    console.log('-- npx au generate value-converter NewThing');
    await run('npx au generate value-converter NewThing', null,
      (data, kill) => {
        t.fail('au generate value-converter failed: ' + data.toString());
      }
    );
    t.pass('generated value-converter');

    console.log('-- npx au generate binding-behavior NewThing');
    await run('npx au generate binding-behavior NewThing', null,
      (data, kill) => {
        t.fail('au generate binding-behavior failed: ' + data.toString());
      }
    );
    t.pass('generated binding-behavior');

    console.log('-- npx au generate task NewThing');
    await run('npx au generate task NewThing', null,
      (data, kill) => {
        t.fail('au generate task failed: ' + data.toString());
      }
    );
    t.pass('generated task');

    console.log('-- npx au generate generator NewThing');
    await run('npx au generate generator NewThing', null,
      (data, kill) => {
        t.fail('au generate generator failed: ' + data.toString());
      }
    );
    t.pass('generated generator');

    console.log('-- npm run build');
    await run('npm run build', null,
      (data, kill) => {
        t.fail('build failed: ' + data.toString());
      }
    );
    t.pass('made dev build');

    console.log('-- npm start');
    await run('npm start',
      async (data, kill) => {
        const m = data.toString().match(serverRegex);
        if (!m) return;
        const url = m[1];
        const message = 'Dev server is started at ' + url;
        console.log(message);
        t.pass(message);

        try {
          if (!process.env.GITHUB_ACTIONS) {
            console.log('-- take screenshot');
            await takeScreenshot(url, path.join(folder, appName + '.png'));
          }

          console.log('-- npm run e2e --if-present');
          await run(`npm run e2e --if-present`);
          kill();
        } catch (e) {
          t.fail(e.message);
          kill();
        }
      },
      (data, kill) => {
        const str = data.toString();
        // ignore nodejs v12 [DEP0066] DeprecationWarning: OutgoingMessage.prototype._headers is deprecated
        if (!str.includes('DeprecationWarning')) {
          t.fail('npm start failed: ' + data.toString());
          kill();
        }
      }
    );

    console.log('-- remove folder ' + appName);
    process.chdir(folder);
    await del(appFolder);
  });
});
