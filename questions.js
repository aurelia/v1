module.exports = [
  {
    message: 'App or Plugin?',
    choices: [
      {title: 'App', hint: 'A normal single page application in Aurelia'},
      {value: 'plugin', title: 'Plugin', hint: 'An Aurelia plugin project'}
    ]
  },
  {
    message: 'Which bundler would you like to use?',
    choices: [
      {value: 'webpack', title: 'Webpack', hint: 'A powerful and popular bundler for modern JavaScript apps.'},
      {value: 'cli-bundler', title: "CLI's built-in bundler with an AMD module loader", hint: 'Provides similar capabilities but with much simpler configuration.'}
    ]
  },
  {
    if: 'cli-bundler',
    message: 'Which AMD module loader would you like to use?',
    choices: [{
      value: 'requirejs',
      title: 'RequireJS',
      hint: 'RequireJS is a mature and stable module loader for JavaScript.'
    }, {
      value: 'alameda',
      title: 'Alameda',
      hint: 'Alameda is a modern version of RequireJS using promises and native es6 features (modern browsers only).',
      if: '!plugin'
    }, {
      value: 'systemjs',
      title: 'SystemJS',
      hint: 'SystemJS is Dynamic ES module loader, the most versatile module loader for JavaScript.',
      if: '!plugin'
    }]
  },
  {
    if: 'webpack',
    message: 'Which HTTP Protocol do you wish the outputted Webpack bundle to be optimised for?',
    choices: [{
      value: 'http1',
      title: 'HTTP/1.1',
      hint: 'The legacy HTTP/1.1 protocol, max 6 parallel requests/connections.'
    }, {
      value: 'http2',
      title: 'HTTP/2',
      hint: 'The modern HTTP/2 Protocol, uses request multiplexing over a single connection.'
    }]
  },
  {
    message: 'What platform are you targeting?',
    choices: [{
      value: 'web',
      title: 'Web',
      hint: 'The default web platform setup.'
    }, {
      value: 'dotnet-core',
      title: '.NET Core',
      hint: 'A powerful, patterns-based way to build dynamic websites with .NET Core.',
      if: '!plugin'
    }]
  },
  {
    message: 'What transpiler would you like to use?',
    choices: [
      {value: 'babel', title: 'Babel', hint: 'An open source, standards-compliant ES2015 and ESNext transpiler.'},
      {value: 'typescript', title: 'TypeScript', hint: 'An open source, ESNext superset that adds optional strong typing.'}
    ]
  },
  {
    message: 'How would you like to setup your HTML template?',
    choices: [{
      title: 'None',
      hint: 'No markup processing'
    }, {
      value: 'htmlmin-min',
      title: 'Minimum Minification',
      hint: 'Removes comments and whitespace between block level elements such as div, blockquote, p, header, footer ...etc.'
    }, {
      value: 'htmlmin-max',
      title: 'Maximum Minification',
      hint: 'Removes comments, script & link element [type] attributes and all whitespace between all elements. Also remove attribute quotes where possible. Collapses boolean attributes.'
    }]
  },
  {
    message: 'What css preprocessor would you like to use?',
    choices: [{
      title: 'None',
      hint: 'Use standard CSS with no pre-processor.'
    }, {
      value: 'less',
      title: 'Less',
      hint: 'Extends the CSS language, adding features that allow variables, mixins, functions and many other techniques.'
    }, {
      value: 'sass',
      title: 'Sass',
      hint: 'A mature, stable, and powerful professional grade CSS extension.'
    }, {
      value: 'stylus',
      title: 'Stylus',
      hint: 'Expressive, dynamic and robust CSS.'
    }]
  },
  {
    message: 'Do you want to add PostCSS processing',
    choices: [{
      title: 'None',
      hint: 'No PostCSS processing'
    }, {
      value: 'postcss-basic',
      title: 'Basic',
      hint: 'With autoprefixer'
    }, {
      value: 'postcss-typical',
      title: 'Typical',
      hint: 'With autoprefixer, postcss-url to inline image/font resources, cssnano to minify',
      if: 'cli-bundler'
    }, {
      value: 'postcss-typical',
      title: 'Typical',
      hint: 'With autoprefixer, plus cssnano to minify',
      // don't need postcss-url for webpack, as webpack's css-loader does similar work
      if: 'webpack'
    }]
  },
  {
    message: 'Which unit test runner would you like to use?',
    choices: [{
      title: 'None',
      hint: 'Skip testing. My code is always perfect :-)'
    }, {
      value: 'karma',
      title: 'Karma + Jasmine',
      hint: 'Unit testing with Karma and Jasmine'
    }, {
      value: 'jest',
      title: 'Jest',
      hint: 'Unit testing with Jest'
    }]
  },
  {
    if: '!plugin',
    message: 'Would you like to configure integration testing?',
    choices: [{
      title: 'None',
      hint: 'Skip testing. My code is always perfect :-)'
    }, {
      value: 'protractor',
      title: 'Protractor',
      hint: 'Integration testing with Protractor.'
    }, {
      value: 'cypress',
      title: 'Cypress',
      hint: "Integration testing with Cypress. Please note: If you've chosen a Typescript, Cypress will add webpack and ts-loader to dependencies due to limited availability of Cypress preprocessors at this point in time."
    }]
  },
  {
    message: 'What is your default code editor?',
    choices: [{
      title: 'None',
      hint: 'Skip any editor specific options.'
    }, {
      value: 'vscode',
      title: 'Visual Studio Code',
      hint: 'Code editing. Redefined. Free. Open source. Runs everywhere.'
    }]
  },
  {
    if: '!plugin',
    message: 'Which features do you want to scaffold into your project?',
    choices: [{
      value: 'scaffold-minimum',
      title: 'Minimum',
      hint: 'Just a bare minimum Aurelia app.'
    }, {
      value: 'scaffold-navigation',
      title: 'Navigation App',
      hint: 'Add a router and some sample routes, Bootstrap v4 and Font Awesome v5.'
    }]
  },
  {
    if: 'plugin',
    message: 'Which features do you want to scaffold into your Aurelia plugin project?',
    choices: [{
      value: 'plugin-scaffold-minimum',
      title: 'None',
      hint: 'Just a bare minimum Aurelia plugin with one custom element.'
    }, {
      value: 'plugin-scaffold-basic',
      title: 'Basic',
      hint: 'Show examples for custom element, attribute, value converter and binding behavior.'
    }]
  },
  {
    if: '!plugin',
    message: 'Would you like to add a Dockerfile?',
    choices: [{
      title: 'No'
    }, {
      value: 'docker', title: 'Sure, yes'
    }]
  }
];
