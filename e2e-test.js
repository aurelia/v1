// This test is not required by "makes" at all.
// It's to ensure all the skeletons here do (kind of) work.
// The whole test suite takes long long time to finish,
// it's not automatically triggered by "npm version patch".
// Have to run "npm run test:e2e" manually before a release.

const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const test = require('ava');
const kill = require('tree-kill');

async function delay(secs) {
  return new Promise((resolve) => {
    setTimeout(resolve, secs);
  });
}

const isWin32 = process.platform === 'win32';

const folder = path.join(__dirname, 'test-skeletons');
console.log('-- cleanup ' + folder);
fs.rmSync(folder, {recursive: true, force: true});
fs.mkdirSync(folder);

// Somehow taskkill on windows would not send SIGTERM signal to proc,
// The proc killed by taskkill got null signal.
const win32Killed = new Set();
function killProc(proc) {
  if (isWin32) {
    win32Killed.add(proc.pid);
  }
  proc.stdin.pause();
  kill(proc.pid);
}


function run(command, cwd, dataCB, errorCB) {
  const [cmd, ...args] = command.split(' ');
  return new Promise((resolve, reject) => {
    const env = Object.create(process.env);
    // use CI to turn off automatic browser opening in tasks/run.js
    env.CI = 'true';
    // need to reset NODE_ENV back to development because this whole
    // test is running in NODE_ENV=test which will affect gulp build
    env.NODE_ENV = 'development';
    const proc = spawn(cmd, args, {env, cwd});
    proc.on('exit', async (code, signal) => {
      await delay(1);
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
          setTimeout(() => killProc(proc), 500);
        });
      }
    });
    proc.stderr.on('data', data => {
      process.stderr.write(data);
      // Skip webpack5 deprecation warning.
      if (data.toString().toLowerCase().includes('deprecation')) return;
      // Skip BABEL warning (used by dumber bundler) when reading @aurelia/runtime-html
      if (data.toString().includes('The code generator has deoptimised the styling')) return;
      if (errorCB) {
        errorCB(data, () => {
          console.log(`-- kill "${command}"`);
          setTimeout(() => killProc(proc), 500);
        });
      }
    })
  });
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
  if (features.includes('webpack')) return /Loopback: (\S+)/;
  return /Dev server is started at: (\S+)/;
}

// The 32 skeletons copied from aurelia-cli.
// This does not cover all possible combinations.
const skeletons = [
  'cli-bundler requirejs babel stylus jest dotnet-core playwright scaffold-navigation docker',
  'cli-bundler requirejs babel htmlmin jest playwright',
  'cli-bundler requirejs babel htmlmin karma dotnet-core playwright scaffold-navigation',
  'cli-bundler requirejs babel less htmlmin postcss karma playwright scaffold-navigation',
  'cli-bundler requirejs typescript jest dotnet-core playwright',
  'cli-bundler requirejs typescript jest playwright',
  'cli-bundler requirejs typescript karma dotnet-core playwright scaffold-navigation vscode',
  'cli-bundler requirejs sass htmlmin typescript karma playwright docker',

  'cli-bundler alameda babel postcss jest dotnet-core playwright',
  'cli-bundler alameda babel jest playwright docker',
  'cli-bundler alameda babel sass karma dotnet-core playwright docker',
  'cli-bundler alameda babel karma playwright scaffold-navigation',
  'cli-bundler alameda stylus typescript jest dotnet-core playwright',
  'cli-bundler alameda less postcss typescript jest playwright docker',
  'cli-bundler alameda htmlmin typescript karma dotnet-core playwright',
  'cli-bundler alameda htmlmin typescript karma playwright',

  'webpack babel stylus jest postcss dotnet-core playwright docker',
  'webpack babel htmlmin jest playwright',
  'webpack babel less jest dotnet-core playwright scaffold-navigation',
  'webpack typescript jest dotnet-core playwright',
  'webpack htmlmin typescript postcss jest playwright scaffold-navigation',
  'webpack sass typescript postcss jest dotnet-core playwright scaffold-navigation vscode docker',

  'plugin cli-bundler requirejs babel stylus htmlmin jest',
  'plugin cli-bundler requirejs babel karma postcss vscode',
  'plugin cli-bundler requirejs htmlmin typescript jest',
  'plugin cli-bundler requirejs typescript karma plugin-scaffold-basic',

  'plugin cli-bundler requirejs babel htmlmin jest',
  'plugin cli-bundler requirejs babel less htmlmin karma plugin-scaffold-basic',
  'plugin cli-bundler requirejs typescript jest',
  'plugin cli-bundler requirejs sass htmlmin typescript postcss karma'
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

    const makeCmd = `npx makes ${__dirname} ${appName} -s ${features.join(',')}`;
    console.log('-- ' + makeCmd);
    await run(makeCmd, folder);
    t.pass('made skeleton');

    patchPackageJson(appFolder, targetCLI);

    console.log('-- npm i');
    await run('npm i', appFolder);
    t.pass('installed deps');

    console.log('-- npm test');
    await run('npm test', appFolder);
    t.pass('finished unit tests');

    console.log('-- npx au generate attribute NewThing');
    await run('npx au generate attribute NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate attribute failed: ' + data.toString());
      }
    );
    t.pass('generated attribute');

    console.log('-- npx au generate component NewThing .');
    await run('npx au generate component NewThing .', appFolder, null,
      (data, kill) => {
        t.fail('au generate component failed: ' + data.toString());
      }
    );
    t.pass('generated component');

    console.log('-- npx au generate element NewThing');
    await run('npx au generate element NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate element failed: ' + data.toString());
      }
    );
    t.pass('generated element');

    console.log('-- npx au generate value-converter NewThing');
    await run('npx au generate value-converter NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate value-converter failed: ' + data.toString());
      }
    );
    t.pass('generated value-converter');

    console.log('-- npx au generate binding-behavior NewThing');
    await run('npx au generate binding-behavior NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate binding-behavior failed: ' + data.toString());
      }
    );
    t.pass('generated binding-behavior');

    console.log('-- npx au generate task NewThing');
    await run('npx au generate task NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate task failed: ' + data.toString());
      }
    );
    t.pass('generated task');

    console.log('-- npx au generate generator NewThing');
    await run('npx au generate generator NewThing', appFolder, null,
      (data, kill) => {
        t.fail('au generate generator failed: ' + data.toString());
      }
    );
    t.pass('generated generator');

    console.log('-- npm run build');
    await run('npm run build', appFolder, null,
      (data, kill) => {
        t.fail('build failed: ' + data.toString());
      }
    );
    t.pass('made dev build');

    console.log('-- npm start');
    const runE2e = async (data, kill) => {
      const m = data.toString().match(serverRegex);
      if (!m) return;
      const url = m[1];
      t.pass(m[0]);
      kill();
    };

    // Webpack5 now prints Loopback: http://localhost:5000 in stderr!
    await run('npm start', appFolder, runE2e, runE2e);

    if (features.includes('playwright')) {
      console.log('-- npx playwright test --project chromium');
      await run('npx playwright install --with-deps', appFolder);
      await run('npx playwright test --project chromium', appFolder);
    }

    if (process.platform === 'linux' && features.includes('docker')) {
      console.log('-- npm run docker:build');
      await run(`npm run docker:build`, appFolder);
      t.pass('passed docker:build');
    }

    console.log('-- remove folder ' + appName);
    await fs.promises.rm(appFolder, {recursive: true});
  });
});
