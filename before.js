// Use "before" task to ask user to select a preset (to skip questionnaire).

const PRESETS = {
  'default-esnext': [ 'jest', 'vscode' ],
  'default-typescript': ['typescript', 'jest', 'vscode'],
  'default-esnext-plugin': [ 'plugin', 'jest', 'vscode' ],
  'default-typescript-plugin': ['plugin', 'typescript', 'jest', 'vscode'],
};


module.exports = async function({unattended, prompts}) {
  // don't ask when running in silent mode.
  if (unattended) return;

  // Support "au new --plugin"
  const argv = process.argv.slice(2);
  const forPlugin = argv.includes('--plugin') || argv.includes('-p');

  const choices = [
    !forPlugin && {
      value: 'default-esnext',
      title: 'Default ESNext Aurelia 1 App',
      hint: 'A basic Aurelia 1 app with Babel and Webpack'
    },
    !forPlugin && {
      value: 'default-typescript',
      title: 'Default TypeScript Aurelia 1 App',
      hint: 'A basic Aurelia 1 app with TypeScript and Webpack'
    },
    {
      value: 'default-esnext-plugin',
      title: 'Default ESNext Aurelia 1 Plugin',
      hint: 'A basic Aurelia 1 plugin with Babel and Webpack'
    },
    {
      value: 'default-typescript-plugin',
      title: 'Default TypeScript Aurelia 1 Plugin',
      hint: 'A basic Aurelia 1 plugin with TypeScript and Webpack'
    },
    !forPlugin && {
      title: 'Custom Aurelia 1 Project',
      hint: 'Select bundler, transpiler, and more.'
    },
    forPlugin && {
      title: 'Custom Aurelia 1 Plugin',
      value: 'custom-plugin',
      hint: 'Select transpiler, and more.'
    }
  ].filter(c => c);

  const preset = await prompts.select({
    message: 'Would you like to use the default setup or customize your choices?',
    choices
  });

  if (preset) {
    const preselectedFeatures = PRESETS[preset];
    if (preselectedFeatures) {
      return {
        silentQuestions: true, // skip following questionnaire
        preselectedFeatures
      };
    } else if (preset === 'custom-plugin') {
      return {
        silentQuestions: false,
        preselectedFeatures: ['plugin']
      };
    }
  }
};
