const {Transform} = require('stream');
const fs = require('fs');
const path = require('path');

function extTransform(properties, features) {
  return new Transform({
    objectMode: true,
    transform: function(file, env, cb) {
      if (file.isBuffer()) {
        if (file.extname === '.ext') {
          // change .ext to .ts or .js file
          file.extname = features.includes('typescript') ? '.ts' : '.js';
        }
      }
      cb(null, file);
    }
  });
};

// Special treatment of 'project.csproj' file
function skipDotnetCsprojIfExists(properties, features, targetDir) {
  let hasCsproj = false;
  try {
    hasCsproj = fs.readdirSync(targetDir).some(
      f => f.endsWith('.csproj')
    );
  } catch (e) {
    //
  }

  return new Transform({
    objectMode: true,
    transform: function(file, env, cb) {
      if (file.isBuffer() && hasCsproj && file.relative === 'project.csproj') {
        // skip 'project.csproj' file
        cb();
        return;
      }
      cb(null, file);
    }
  });
}

function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (err) {
    // ignore
    return false;
  }
};

function instructionsForSkippedFiles(properties, features, targetDir) {
  const skipped = [];
  const instructions = {};

  return new Transform({
    objectMode: true,
    transform: function(file, env, cb) {
      if (file.isBuffer()) {
        if (file.writePolicy === 'skip' && isFile(path.join(targetDir, file.relative))) {
          // This file is to be skipped
          skipped.push(file.relative);
        }
        if (file.basename.endsWith('__instructions')) {
          instructions[file.relative.slice(0, -14)] = file.contents.toString('utf8');
          // remove instruction files
          cb();
          return;
        }
      }
      cb(null, file);
    },
    // flush
    flush: function(cb) {
      let all = '';
      skipped.forEach(filename => {
        const instruction = instructions[filename];
        if (instruction) {
          all += instruction + '\n';
        }
      });

      if (!all) {
        cb();
        return;
      }

      const instFileName = 'instructions.txt';
      console.warn('Manual changes are necessary:\n');
      console.log(all + '\n');
      console.info(`If you would like to do this at a later time, we've written these instructions to a file called '${instFileName}' in the project directory for you.\n`);
      // Avoid using Vinyl file, in order to have zero dependencies.
      fs.writeFileSync(path.join(process.cwd(), targetDir, instFileName), all);
      cb();
    }
  });
}

exports.append = [
  extTransform,
  skipDotnetCsprojIfExists,
  instructionsForSkippedFiles
];