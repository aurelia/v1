const test = require('ava');
const Vinyl = require('vinyl');
const {Writable} = require('stream');
const mockfs = require('mock-fs');
const {append} = require('../transforms');
const [
  extTransform,
  skipDotnetCsprojIfExists,
  instructionsForSkippedFiles
] = append;

test('Append transforms', t => {
  t.is(typeof extTransform, 'function');
  t.is(typeof skipDotnetCsprojIfExists, 'function');
  t.is(typeof instructionsForSkippedFiles, 'function');
});

test.cb('ext-transform translates .ext file to .js file when typescript is not selected', t => {
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

test.cb('ext-transform translates .ext file to .ts file when typescript is selected', t => {
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

test.cb('skips project.csproj if project.csproj file exists', t => {
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

test.cb('skips project.csproj if any .csproj file exists', t => {
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

test.cb('writes project.csproj if no .csproj file exists', t => {
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
