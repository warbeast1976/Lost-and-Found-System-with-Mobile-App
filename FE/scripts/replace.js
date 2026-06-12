const fs = require('fs');
const path = require('path');

const mappings = {
  '🔍': '<i data-lucide="search"></i>',
  '📦': '<i data-lucide="package"></i>',
  '🗂️': '<i data-lucide="folder-open"></i>',
  '📍': '<i data-lucide="map-pin"></i>',
  '📅': '<i data-lucide="calendar"></i>',
  '🎨': '<i data-lucide="palette"></i>',
  '🏷️': '<i data-lucide="tag"></i>',
  '🔴': '<i data-lucide="alert-circle"></i>',
  '🟢': '<i data-lucide="check-circle"></i>',
  '❌': '<i data-lucide="x-circle"></i>',
  '🛡️': '<i data-lucide="shield"></i>',
  '📷': '<i data-lucide="camera"></i>',
  '✦': '<i data-lucide="check"></i>',
  '📊': '<i data-lucide="bar-chart"></i>',
  '👥': '<i data-lucide="users"></i>',
  '🔑': '<i data-lucide="key"></i>',
  '⚙️': '<i data-lucide="settings"></i>'
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
