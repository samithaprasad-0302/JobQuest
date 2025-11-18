#!/usr/bin/env node

/**
 * Route Converter Helper Script
 * Helps convert Mongoose patterns to Sequelize patterns
 * Usage: node scripts/convert-routes.js
 */

const fs = require('fs');
const path = require('path');

const conversions = [
  // Import statements
  {
    pattern: /const\s+(\w+)\s*=\s*require\(['"]\.\.\/models\/(\w+)['"]\);?/g,
    replacement: (match, varName, modelName) => {
      return `const { ${modelName} } = require('../models');`;
    },
    description: 'Convert model imports to use destructuring from models/index.js'
  },
  
  // Remove mongoose require
  {
    pattern: /const\s+mongoose\s*=\s*require\(['"]mongoose['"]\);?\n?/g,
    replacement: '',
    description: 'Remove mongoose import'
  },

  // findOne with email
  {
    pattern: /await\s+(\w+)\.findOne\(\s*\{\s*email\s*:\s*(\w+)\s*\}\s*\)/g,
    replacement: (match, model, emailVar) => {
      return `await ${model}.findOne({ where: { email: ${emailVar} } })`;
    },
    description: 'Convert findOne({ email }) to Sequelize syntax'
  },

  // findOne with object
  {
    pattern: /await\s+(\w+)\.findOne\(\s*\{([^}]+)\}\s*\)/g,
    replacement: (match, model, fields) => {
      return `await ${model}.findOne({ where: {${fields}} })`;
    },
    description: 'Convert findOne({...}) to Sequelize syntax'
  },

  // findById
  {
    pattern: /await\s+(\w+)\.findById\(\s*(\w+)\s*\)/g,
    replacement: (match, model, id) => {
      return `await ${model}.findByPk(${id})`;
    },
    description: 'Convert findById to findByPk'
  },

  // find() without parameters
  {
    pattern: /await\s+(\w+)\.find\(\s*\{\s*\}\s*\)/g,
    replacement: (match, model) => {
      return `await ${model}.findAll()`;
    },
    description: 'Convert find({}) to findAll()'
  },

  // find with query
  {
    pattern: /await\s+(\w+)\.find\(\s*(\w+)\s*\)/g,
    replacement: (match, model, queryVar) => {
      return `await ${model}.findAll({ where: ${queryVar} })`;
    },
    description: 'Convert find(query) to findAll({ where: query })'
  },

  // countDocuments
  {
    pattern: /await\s+(\w+)\.countDocuments\(\s*(\{[^}]*\})\s*\)/g,
    replacement: (match, model, query) => {
      return `await ${model}.count({ where: ${query} })`;
    },
    description: 'Convert countDocuments to count'
  },

  // Create with new and save
  {
    pattern: /const\s+(\w+)\s*=\s*new\s+(\w+)\(\{([^}]+)\}\);\s*await\s+\1\.save\(\);/g,
    replacement: (match, varName, model, fields) => {
      return `const ${varName} = await ${model}.create({${fields}});`;
    },
    description: 'Convert new Model() + save() to create()'
  },

  // populate
  {
    pattern: /\.populate\(\s*['"](\w+)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g,
    replacement: (match, relation, fields) => {
      const fieldsPart = fields ? `attributes: ['${fields.split(' ').join("', '")}']` : '';
      return `.include([{ model: ${relation}, ${fieldsPart} }])`;
    },
    description: 'Convert populate to include'
  },

  // select (positive)
  {
    pattern: /\.select\(\s*['"]([^'"]+)['"]\s*\)/g,
    replacement: (match, fields) => {
      const fieldArray = fields.split(' ').map(f => `'${f}'`).join(', ');
      return `.attributes([${fieldArray}])`;
    },
    description: 'Convert select to attributes'
  },

  // skip and limit
  {
    pattern: /\.skip\(\s*(\w+)\s*\)\.limit\(\s*(\w+)\s*\)/g,
    replacement: (match, skip, limit) => {
      return `{ offset: ${skip}, limit: ${limit} }`;
    },
    description: 'Convert skip/limit to offset/limit'
  },

  // sort
  {
    pattern: /\.sort\(\s*\{\s*(\w+):\s*(-?\d+)\s*\}\s*\)/g,
    replacement: (match, field, order) => {
      const dir = order === '1' || order === 1 ? 'ASC' : 'DESC';
      return `.order([['${field}', '${dir}']])`;
    },
    description: 'Convert sort to order'
  }
];

// Main converter function
const convertFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changeCount = 0;

    conversions.forEach(({ pattern, replacement, description }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        changeCount++;
        content = newContent;
        console.log(`  ✓ ${description}`);
      }
    });

    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`\n✅ Converted ${filePath} (${changeCount} patterns matched)\n`);
      return true;
    } else {
      console.log(`⚠️  No patterns matched in ${filePath}\n`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
const main = () => {
  const routesDir = path.join(__dirname, '../routes');
  
  console.log('🔄 Starting route conversion...\n');

  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

  let convertedCount = 0;
  files.forEach(file => {
    console.log(`📝 Processing ${file}...`);
    if (convertFile(path.join(routesDir, file))) {
      convertedCount++;
    }
  });

  console.log(`\n✅ Conversion complete! Processed ${convertedCount} files.\n`);
  console.log('⚠️  IMPORTANT: Review the converted files manually!');
  console.log('   The automatic conversion may not handle all cases correctly.\n');
};

if (require.main === module) {
  main();
}

module.exports = { convertFile };
