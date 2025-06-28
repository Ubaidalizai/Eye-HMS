const fs = require('fs');
const path = require('path');

const isJSX = (content) => /<[^>]+>|React\.createElement/.test(content);
const IMPORT_REGEX = /from\s+['"](.+?)['"]/g;

const renamedFiles = new Map(); // track renamed files: oldPath -> newPath

const walkAndRename = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkAndRename(fullPath);
    } else if (stat.isFile() && path.extname(fullPath) === '.js') {
      const content = fs.readFileSync(fullPath, 'utf-8');

      if (isJSX(content)) {
        const newPath = fullPath.replace(/\.js$/, '.jsx');
        fs.renameSync(fullPath, newPath);
        renamedFiles.set(fullPath, newPath);
        console.log(`✅ Renamed: ${file} → ${path.basename(newPath)}`);
      }
    }
  }
};

const updateImports = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updateImports(fullPath);
    } else if (
      stat.isFile() &&
      (path.extname(fullPath) === '.js' || path.extname(fullPath) === '.jsx')
    ) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let updated = false;

      content = content.replace(IMPORT_REGEX, (match, importPath) => {
        const importFile = path.resolve(path.dirname(fullPath), importPath);
        const importJS = `${importFile}.js`;
        const importIndexJS = path.join(importFile, 'index.js');

        if (renamedFiles.has(importJS)) {
          updated = true;
          return `from "${importPath}.jsx"`;
        } else if (renamedFiles.has(importIndexJS)) {
          updated = true;
          return `from "${importPath}/index.jsx"`;
        }

        return match;
      });

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`🛠️  Updated imports in: ${file}`);
      }
    }
  }
};

const srcPath = path.join(__dirname, 'src');

walkAndRename(srcPath); // Step 1: Rename .js to .jsx
updateImports(srcPath); // Step 2: Fix import paths
