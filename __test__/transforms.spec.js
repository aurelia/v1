const test = require('ava');
const fs = require('fs');
const Vinyl = require('vinyl');
const {Writable} = require('stream');
const mockfs = require('mock-fs');
const {append} = require('../transforms');
const [
  extTransform,
  skipDotnetCsprojIfExists,
  instructionsForSkippedFiles
] = append;

test.serial('Append transforms', t => {
  t.is(typeof extTransform, 'function');
  t.is(typeof skipDotnetCsprojIfExists, 'function');
  t.is(typeof instructionsForSkippedFiles, 'function');
});

test.serial.cb('ext-transform translates .ext file to .js file when typescript is not selected', t => {
  const jsExt = extTransform({}, []);
  const files = [];

  jsExt.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  jsExt.on('end', () => {
    t.is(files.length, 2);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/a.js');
    t.is(files[0].contents.toString(), 'var a = 1;');
    t.is(files[1].path.replace(/\\/g, '/'), 'test/b.html');
    t.is(files[1].contents.toString(), '<p></p>');
    t.end();
  })

  jsExt.write(new Vinyl({
    path: 'test/a.ext',
    contents: Buffer.from('var a = 1;')
  }));

  jsExt.end(new Vinyl({
    path: 'test/b.html',
    contents: Buffer.from('<p></p>')
  }));
});

test.serial.cb('ext-transform translates .ext file to .ts file when typescript is selected', t => {
  const jsExt = extTransform({}, ['typescript']);
  const files = [];

  jsExt.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  jsExt.on('end', () => {
    t.is(files.length, 2);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/a.ts');
    t.is(files[0].contents.toString(), 'var a = 1;');
    t.is(files[1].path.replace(/\\/g, '/'), 'test/b.html');
    t.is(files[1].contents.toString(), '<p></p>');
    t.end();
  })

  jsExt.write(new Vinyl({
    path: 'test/a.ext',
    contents: Buffer.from('var a = 1;')
  }));

  jsExt.end(new Vinyl({
    path: 'test/b.html',
    contents: Buffer.from('<p></p>')
  }));
});

test.serial.cb('skips project.csproj if project.csproj file exists', t => {
  mockfs({
    'project.csproj': 'csproj'
  });

  const skipCsproj = skipDotnetCsprojIfExists({}, [], '.');
  const files = [];

  skipCsproj.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  skipCsproj.on('end', () => {
    t.is(files.length, 0);
    mockfs.restore();
    t.end();
  })

  skipCsproj.end(new Vinyl({
    path: 'test/project.csproj',
    base: 'test/',
    contents: Buffer.from('new-csproj')
  }));
});

test.serial.cb('skips project.csproj if any .csproj file exists', t => {
  mockfs({
    'some.csproj': 'csproj'
  });

  const skipCsproj = skipDotnetCsprojIfExists({}, [], '.');
  const files = [];

  skipCsproj.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  skipCsproj.on('end', () => {
    t.is(files.length, 0);
    mockfs.restore();
    t.end();
  })

  skipCsproj.end(new Vinyl({
    path: 'test/project.csproj',
    base: 'test/',
    contents: Buffer.from('new-csproj')
  }));
});

test.serial.cb('writes project.csproj if no .csproj file exists', t => {
  mockfs({});

  const skipCsproj = skipDotnetCsprojIfExists({}, [], '.');
  const files = [];

  skipCsproj.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  skipCsproj.on('end', () => {
    t.is(files.length, 1);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/project.csproj');
    t.is(files[0].contents.toString(), 'new-csproj');
    mockfs.restore();
    t.end();
  })

  skipCsproj.end(new Vinyl({
    path: 'test/project.csproj',
    base: 'test/',
    contents: Buffer.from('new-csproj')
  }));
});

test.serial.cb('does not write instructions if file is not skipped', t => {
  mockfs({});

  const instructions = instructionsForSkippedFiles({}, [], '.');
  const files = [];

  instructions.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  instructions.on('end', () => {
    t.is(files.length, 1);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/file.js');
    t.is(files[0].writePolicy, 'skip');
    t.is(files[0].contents.toString(), 'new file');
    mockfs.restore();
    t.end();
  })

  instructions.write(new Vinyl({
    path: 'test/file.js__instructions',
    base: 'test/',
    contents: Buffer.from('do something')
  }));

  instructions.end(new Vinyl({
    path: 'test/file.js',
    base: 'test/',
    writePolicy: 'skip',
    contents: Buffer.from('new file')
  }));
});

test.serial.cb('writes instructions if file is skipped', t => {
  mockfs({
    'folder': {
      'file.js': 'old file'
    }
  });

  const instructions = instructionsForSkippedFiles({}, [], '.');
  const files = [];

  instructions.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  instructions.on('end', () => {
    t.is(files.length, 1);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/folder/file.js');
    t.is(files[0].writePolicy, 'skip');
    t.is(fs.readFileSync('instructions.txt', 'utf8'), 'do something\n');
    mockfs.restore();
    t.end();
  })

  instructions.write(new Vinyl({
    path: 'test/folder/file.js__instructions',
    base: 'test/',
    contents: Buffer.from('do something')
  }));

  instructions.end(new Vinyl({
    path: 'test/folder/file.js',
    base: 'test/',
    writePolicy: 'skip',
    contents: Buffer.from('new file')
  }));
});

test.serial.cb('merges instructions if multiple files is skipped', t => {
  mockfs({
    'folder': {
      'file.js': 'old file'
    },
    'file.c': 'old c file'
  });

  const instructions = instructionsForSkippedFiles({}, [], '.');
  const files = [];

  instructions.pipe(new Writable({
    objectMode: true,
    write(file, enc, cb) {
      files.push(file);
      cb();
    }
  }));

  instructions.on('end', () => {
    t.is(files.length, 2);
    t.is(files[0].path.replace(/\\/g, '/'), 'test/folder/file.js');
    t.is(files[0].writePolicy, 'skip');
    t.is(files[0].contents.toString(), 'new file');

    t.is(files[1].path.replace(/\\/g, '/'), 'test/file.c');
    t.is(files[1].writePolicy, 'skip');
    t.is(files[1].contents.toString(), 'new c file');

    t.is(fs.readFileSync('instructions.txt', 'utf8'), 'do something\ndo something on c\n');
    mockfs.restore();
    t.end();
  })

  instructions.write(new Vinyl({
    path: 'test/folder/file.js__instructions',
    base: 'test/',
    contents: Buffer.from('do something')
  }));

  instructions.write(new Vinyl({
    path: 'test/folder/file.js',
    base: 'test/',
    writePolicy: 'skip',
    contents: Buffer.from('new file')
  }));

  instructions.write(new Vinyl({
    path: 'test/file.c__instructions',
    base: 'test/',
    contents: Buffer.from('do something on c')
  }));

  instructions.end(new Vinyl({
    path: 'test/file.c',
    base: 'test/',
    writePolicy: 'skip',
    contents: Buffer.from('new c file')
  }));
});

