const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY
};
const missingKeys = Object.entries(config)
  .filter(([, value]) => !value || !value.trim())
  .map(([key]) => `EMAILJS_${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`);

if (missingKeys.length > 0) {
  throw new Error(`Missing ${missingKeys.join(', ')} in .env. Copy .env.example to .env and fill in the values.`);
}

const outputDirectory = path.join(__dirname, 'dist');
fs.mkdirSync(outputDirectory, { recursive: true });

for (const filename of fs.readdirSync(__dirname)) {
  if (!filename.endsWith('.html')) continue;

  const htmlPath = path.join(__dirname, filename);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scriptTag = '<script src="script.js"></script>';

  if (!html.includes(scriptTag)) {
    throw new Error(`Could not find ${scriptTag} in ${filename}.`);
  }

  fs.writeFileSync(
    path.join(outputDirectory, filename),
    html.replace(scriptTag, '<script src="emailjs-config.js"></script>' + scriptTag)
  );
}

for (const filename of ['script.js', 'style.css']) {
  fs.copyFileSync(path.join(__dirname, filename), path.join(outputDirectory, filename));
}

fs.cpSync(path.join(__dirname, 'images'), path.join(outputDirectory, 'images'), { recursive: true });
fs.writeFileSync(
  path.join(outputDirectory, 'emailjs-config.js'),
  `window.emailJsConfig = Object.freeze(${JSON.stringify(config)});\n`
);

console.log('Built site to dist/. EmailJS settings are public in the generated browser code.');
