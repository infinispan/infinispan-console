const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LANG_DIR = path.join(__dirname, 'src/app/assets/languages');
const SOURCE_LANG = 'en.json';

/**
 * Map of filename/code to the full language name for the LLM prompt.
 */
const TARGET_LANGS = {
  'ar.json': 'Arabic',
  'fr.json': 'French',
  'es.json': 'Spanish',
  'de.json': 'German',
  'hi.json': 'Hindi',
  'it.json': 'Italian',
  'ja.json': 'Japanese',
  'pt.json': 'Portuguese',
  'zh.json': 'Chinese'
};

const GLOSSARIES = {
  'Italian': "In Italian: 'cache' is feminine (la cache), 'query' is feminine (la query), 'database' is masculine (il database), 'email' is feminine (la email), 'link' is masculine (il link).",
  'French': "In French: 'cache' is masculine (le cache), 'cloud' is masculine (le cloud), 'interface' is feminine (la interface), 'e-mail' is feminine (la pièce jointe / le courriel).",
  'Spanish': "In Spanish: 'cache' is feminine (la caché), 'app' is feminine (la aplicación/la app), 'password' is feminine (la contraseña), 'database' is feminine (la base de datos).",
  'German': "In German: 'Software' is feminine (die Software), 'Computer' is masculine (der Computer), 'Update' is neuter (das Update), 'WLAN' is neuter (das WLAN)."
};

const OLLAMA_MODEL = 'qwen2.5-coder:7b';
const CHUNK_SIZE = 25;

/**
 * Sends a batch of strings to Ollama.
 */
async function translateBatch(batch, fullLanguageName, glossary) {
  if (Object.keys(batch).length === 0) return {};

  const prompt = `
    You are a professional translator. Translate the following English UI strings into ${fullLanguageName}. 
    Maintain the tone of a professional software application.
    Return ONLY a valid JSON object with the exact same keys.
    
    Strings: ${JSON.stringify(batch)}`;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: OLLAMA_MODEL,
      prompt: prompt,
      format: 'json',
      stream: false,
      options: {
        temperature: 0.3 // Lower temperature for more consistent, literal translations
      }
    });
    
    return JSON.parse(response.data.response);
  } catch (error) {
    console.error(`  ❌ Chunk failed for ${fullLanguageName}: ${error.message}`);
    return {};
  }
}

/**
 * Flattens nested JSON into a dot-notated map.
 */
function getMissingEntries(source, target, pathPrefix = '') {
  let missing = {};
  for (const key in source) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const sVal = source[key];
    const tVal = target ? target[key] : undefined;

    if (typeof sVal === 'object' && sVal !== null && !Array.isArray(sVal)) {
      Object.assign(missing, getMissingEntries(sVal, tVal, fullPath));
    } else if (tVal === undefined || tVal === "") {
      missing[fullPath] = sVal;
    }
  }
  return missing;
}

/**
 * Reconstructs nested JSON from dot-notation.
 */
function setPath(obj, pathStr, value) {
  const keys = pathStr.split('.');
  let current = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
}

/**
 * Removes keys from target that don't exist in source.
 */
function pruneTarget(source, target) {
  if (typeof source !== 'object' || source === null) return;
  Object.keys(target).forEach(key => {
    if (!(key in source)) {
      delete target[key];
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      pruneTarget(source[key], target[key]);
    }
  });
}

async function runSync() {
  const sourceFilePath = path.join(LANG_DIR, SOURCE_LANG);
  if (!fs.existsSync(sourceFilePath)) {
    console.error("Source file 'en.json' not found.");
    return;
  }

  const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

  // Iterate through the map
  for (const [filename, langName] of Object.entries(TARGET_LANGS)) {
    const targetPath = path.join(LANG_DIR, filename);
    let targetData = fs.existsSync(targetPath) ? JSON.parse(fs.readFileSync(targetPath, 'utf8')) : {};

    const missing = getMissingEntries(sourceData, targetData);
    const keys = Object.keys(missing);

    if (keys.length > 0) {
      console.log(`\n🌍 Translating ${keys.length} keys for ${langName.toUpperCase()}...`);
      const glossary = GLOSSARIES[langName] || "";
      
      for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
        const chunkKeys = keys.slice(i, i + CHUNK_SIZE);
        const chunkBatch = {};
        chunkKeys.forEach(k => { chunkBatch[k] = missing[k]; });
        
        process.stdout.write(`  > Chunk ${Math.floor(i/CHUNK_SIZE) + 1}/${Math.ceil(keys.length/CHUNK_SIZE)}... `);
        
        const translated = await translateBatch(chunkBatch, langName, glossary);
        Object.entries(translated).forEach(([path, val]) => setPath(targetData, path, val));
        
        console.log('Done.');
      }
    }

    pruneTarget(sourceData, targetData);
    fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
    console.log(`✅ ${filename} (${langName}) is synchronized.`);
  }
}

runSync();
