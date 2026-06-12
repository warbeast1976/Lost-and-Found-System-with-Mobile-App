const fs = require('fs');
const path = require('path');

const mappings = {
  '🏠': '<i data-lucide="home"></i>',
  '📝': '<i data-lucide="file-text"></i>',
  '👋': '<i data-lucide="hand"></i>',
  '⏳': '<i data-lucide="hourglass"></i>',
  '✅': '<i data-lucide="check-circle-2"></i>',
  '📋': '<i data-lucide="clipboard-list"></i>',
  'ℹ️': '<i data-lucide="info"></i>',
  '⚠️': '<i data-lucide="alert-triangle"></i>'
};

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filelist = walkSync(fullPath, filelist);
    } else {
      if (file.endsWith('.js')) filelist.push(fullPath);
    }
  });
  return filelist;
}

const jsFiles = [...walkSync('page'), ...walkSync('components'), ...walkSync('core')];

jsFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  for (const [emoji, icon] of Object.entries(mappings)) {
    content = content.replaceAll(emoji, icon);
  }
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated', f);
  }
});
