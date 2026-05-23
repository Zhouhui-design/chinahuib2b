#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Translation Completeness Checker
 * Checks all language dictionaries against English reference
 */

const fs = require('fs')
const path = require('path')

// Read the dictionary file
const dictionaryPath = path.join(__dirname, '../src/locales/dictionary.ts')
const content = fs.readFileSync(dictionaryPath, 'utf-8')

// Languages to check
const languages = ['en', 'zh', 'es', 'fr', 'ar', 'de', 'ja', 'ko', 'pt', 'ru']

console.log('🌍 Translation Completeness Check\n')
console.log('=' .repeat(60))

// Simple parser to extract top-level keys for each language
function extractLanguageSection(lang) {
  const regex = new RegExp(`${lang}:\\s*\\{`, 'i')
  const match = content.match(regex)
  
  if (!match) {
    return null
  }
  
  // Count nested braces to find the end of this language block
  let startIndex = match.index + match[0].length
  let braceCount = 1
  let endIndex = startIndex
  
  while (braceCount > 0 && endIndex < content.length) {
    const char = content[endIndex]
    if (char === '{') braceCount++
    if (char === '}') braceCount--
    endIndex++
  }
  
  return content.substring(startIndex, endIndex - 1)
}

// Count key occurrences in a section
function countKeys(section) {
  if (!section) return 0
  
  // Match property names (simplified)
  const matches = section.match(/[\w]+:\s*(?:"[^"]*"|'[^']*'|\{|[a-zA-Z])/g)
  return matches ? matches.length : 0
}

// Get detailed stats
const enSection = extractLanguageSection('en')
const enKeyCount = countKeys(enSection)

console.log(`\n📊 Reference: English (en) - ${enKeyCount} keys\n`)

const stats = []

languages.forEach(lang => {
  if (lang === 'en') return
  
  const section = extractLanguageSection(lang)
  const keyCount = countKeys(section)
  const completeness = enKeyCount > 0 ? ((keyCount / enKeyCount) * 100).toFixed(1) : 0
  
  let status = '❌'
  if (completeness >= 90) status = '✅'
  else if (completeness >= 50) status = '⚠️ '
  
  stats.push({
    lang,
    keyCount,
    completeness,
    status
  })
})

// Sort by completeness
stats.sort((a, b) => parseFloat(b.completeness) - parseFloat(a.completeness))

// Display results
console.log('Language Stats:')
console.log('-'.repeat(60))
console.log('Lang | Keys  | Complete | Status')
console.log('-'.repeat(60))

stats.forEach(stat => {
  console.log(
    `${stat.lang.padEnd(4)} | ${stat.keyCount.toString().padStart(5)} | ${stat.completeness.padStart(7)}% | ${stat.status}`
  )
})

console.log('-'.repeat(60))

// Recommendations
console.log('\n💡 Recommendations:\n')

const incomplete = stats.filter(s => parseFloat(s.completeness) < 100)

if (incomplete.length === 0) {
  console.log('✅ All languages are complete!')
} else {
  console.log('Priority order for completion:\n')
  
  incomplete.forEach((stat, index) => {
    const priority = index < 3 ? '🔴 HIGH' : index < 6 ? '🟡 MEDIUM' : '🟢 LOW'
    console.log(`${index + 1}. ${stat.lang.toUpperCase()} (${stat.completeness}% complete) - ${priority}`)
  })
  
  console.log('\n📝 Next Steps:')
  console.log('1. Focus on HIGH priority languages first')
  console.log('2. Use AI translation tools for initial draft')
  console.log('3. Have native speakers review translations')
  console.log('4. Test UI with each language')
}

console.log('\n' + '='.repeat(60))
console.log('Check complete!\n')

// Export for CI/CD
if (process.argv.includes('--json')) {
  const output = {
    timestamp: new Date().toISOString(),
    reference: { lang: 'en', keys: enKeyCount },
    languages: stats,
  }
  console.log(JSON.stringify(output, null, 2))
}
