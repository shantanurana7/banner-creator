const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const outputDir = path.join(rootDir, 'client-version');

if (!fs.existsSync(buildDir)) {
  console.error("No build directory found. Run npm run build first.");
  process.exit(1);
}

// 1. Read index.html
let html = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');

// 2. Inline CSS
const cssRegex = /<link href="([^"]+\.css)" rel="stylesheet">/g;
html = html.replace(cssRegex, (match, cssPath) => {
  const localCssPath = path.join(buildDir, cssPath.startsWith('/') ? cssPath.slice(1) : cssPath);
  if (fs.existsSync(localCssPath)) {
    const cssContent = fs.readFileSync(localCssPath, 'utf8');
    return `<style>${cssContent}</style>`;
  }
  return match;
});

// 3. Inline JS and move it to the end of body (inline scripts in head execute before body exists)
const jsRegex = /<script defer="defer" src="([^"]+\.js)"><\/script>/g;
let allJsContent = [];
html = html.replace(jsRegex, (match, jsPath) => {
  const localJsPath = path.join(buildDir, jsPath.startsWith('/') ? jsPath.slice(1) : jsPath);
  if (fs.existsSync(localJsPath)) {
    allJsContent.push(fs.readFileSync(localJsPath, 'utf8'));
  }
  return ''; // Remove from head
});

if (allJsContent.length > 0) {
  const inlineScripts = allJsContent.map(content => `<script>${content}</script>`).join('\n');
  html = html.replace('</body>', `${inlineScripts}</body>`);
}

// 4. Base64 encode and inline fonts
const fontNames = ['CondeSans-Bold.otf', 'UniversLTStd.otf', 'UniversLTStd-Bold.otf'];
fontNames.forEach(font => {
  const fontPath = path.join(buildDir, 'assets', font);
  if (fs.existsSync(fontPath)) {
    const base64 = fs.readFileSync(fontPath).toString('base64');
    const dataUri = `data:font/opentype;base64,${base64}`;
    html = html.split(`"/assets/${font}"`).join(`"${dataUri}"`);
    html = html.split(`'/assets/${font}'`).join(`'${dataUri}'`);
    html = html.split(`"./assets/${font}"`).join(`"${dataUri}"`);
    html = html.split(`'./assets/${font}'`).join(`'${dataUri}'`);
  }
});

// 5. Base64 encode and inline logo SVG
const svgPath = path.join(buildDir, 'assets', 'KPMG_blue_logo.svg');
if (fs.existsSync(svgPath)) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const base64 = Buffer.from(svgContent).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${base64}`;
  html = html.split(`"/assets/KPMG_blue_logo.svg"`).join(`"${dataUri}"`);
  html = html.split(`'/assets/KPMG_blue_logo.svg'`).join(`'${dataUri}'`);
  html = html.split(`"./assets/KPMG_blue_logo.svg"`).join(`"${dataUri}"`);
  html = html.split(`'./assets/KPMG_blue_logo.svg'`).join(`'${dataUri}'`);
}

// 6. Write to client-version folder
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outPath = path.join(outputDir, 'index.html');
fs.writeFileSync(outPath, html);

console.log(`\n✅ Client version created successfully!`);
console.log(`Single standalone HTML file generated at: client-version/index.html\n`);
