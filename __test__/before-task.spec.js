const test = require('ava');
const before = require('../before');

test.serial('"before" task does nothing in unattended mode', async t => {
  const prompts = {
    select() {
      t.fail('should not call me');
    }
  };

  const result = await before({unattended: true, prompts, preselectedFeatures: ['a', 'b']});
  t.is(result, undefined);
});

test.serial('"before" task adds "plugin" to preselected features in unattended mode with --plugin', async t => {
  const prompts = {
    select() {
      t.fail('should not call me');
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '--plugin', '-s', 'a,b'];
  const result = await before({unattended: true, prompts, preselectedFeatures: ['a', 'b']});
  t.deepEqual(result, {
    preselectedFeatures: ['a', 'b', 'plugin']
  });
  process.argv = oldArgv;
});

test.serial('"before" task can select default-esnext preset', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-esnext'));
      return 'default-esnext';
    }
  };

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['vscode']
  });
});

test.serial('"before" task can select default-typescript preset', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-typescript'));
      return new Promise(resolve => {
        setTimeout(() => resolve('default-typescript'), 10);
      });
    }
  };

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['typescript', 'vscode']
  });
});

test.serial('"before" task can select default-esnext-plugin preset', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-esnext-plugin'));
      return 'default-esnext-plugin';
    }
  };

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['plugin', 'vscode']
  });
});

test.serial('"before" task can select default-typescript-plugin preset', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-typescript-plugin'));
      return new Promise(resolve => {
        setTimeout(() => resolve('default-typescript-plugin'), 10);
      });
    }
  };

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['plugin', 'typescript', 'vscode']
  });
});

test.serial('"before" task can select no preset', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === undefined));
      return new Promise(resolve => {
        setTimeout(() => resolve(), 10);
      });
    }
  };

  const result = await before({unattended: false, prompts});
  t.is(result, undefined);
});

test.serial('"before" task cannot select default-esnext preset with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.falsy(opts.choices.find(c => c.value === 'default-esnext'));
      return undefined;
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '--plugin'];
  await before({unattended: false, prompts});
  process.argv = oldArgv;
});

test.serial('"before" task cannot select default-typescript preset with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.falsy(opts.choices.find(c => c.value === 'default-typescript'));
      return;
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '--plugin'];
  await before({unattended: false, prompts});
  process.argv = oldArgv;
});

test.serial('"before" task can select default-esnext-plugin preset with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-esnext-plugin'));
      return 'default-esnext-plugin';
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '--plugin'];

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['plugin', 'vscode']
  });

  process.argv = oldArgv;
});

test.serial('"before" task can select default-typescript-plugin preset with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'default-typescript-plugin'));
      return new Promise(resolve => {
        setTimeout(() => resolve('default-typescript-plugin'), 10);
      });
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '-p'];

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: true,
    preselectedFeatures: ['plugin', 'typescript', 'vscode']
  });
  process.argv = oldArgv;
});

test.serial('"before" task can not select no preset with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.falsy(opts.choices.find(c => c.value === undefined));
      return new Promise(resolve => {
        setTimeout(() => resolve(), 10);
      });
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '-p'];
  await before({unattended: false, prompts});
  process.argv = oldArgv;
});

test.serial('"before" task can select custom plugin with --plugin', async t => {
  const prompts = {
    select(opts) {
      t.truthy(opts.choices.find(c => c.value === 'custom-plugin'));
      return new Promise(resolve => {
        setTimeout(() => resolve('custom-plugin'), 10);
      });
    }
  };

  const oldArgv = process.argv;
  process.argv = ['node', 'makes', 'aurelia/au1', '-p'];

  const result = await before({unattended: false, prompts});
  t.deepEqual(result, {
    silentQuestions: false,
    preselectedFeatures: ['plugin']
  });
  process.argv = oldArgv;
});
