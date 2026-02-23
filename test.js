#!/usr/bin/env node

/**
 * Quick Test Script
 * Checks if all assets are present and ready for launch
 * Usage: node test.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Portfolio Readiness Check             ║');
console.log('╚════════════════════════════════════════╝\n');

let passCount = 0;
let warnCount = 0;
let failCount = 0;

function checkFile(filepath, name) {
    if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`✅ ${name} (${size}KB)`);
        passCount++;
        return true;
    } else {
        console.log(`❌ MISSING: ${name}`);
        failCount++;
        return false;
    }
}

function checkDirectory(dirpath, name, expectedCount = null) {
    if (fs.existsSync(dirpath)) {
        const files = fs.readdirSync(dirpath);
        const count = files.length;
        
        if (expectedCount && count !== expectedCount) {
            console.log(`⚠️  ${name} (${count} files, expected ${expectedCount})`);
            warnCount++;
            return false;
        } else {
            console.log(`✅ ${name} (${count} files)`);
            passCount++;
            return true;
        }
    } else {
        console.log(`❌ MISSING: ${name} directory`);
        failCount++;
        return false;
    }
}

// ========================================
// FILE CHECKS
// ========================================

console.log('📋 CORE FILES');
checkFile('./index.html', 'index.html');
checkFile('./style.css', 'style.css');
checkFile('./script.js', 'script.js');
checkFile('./package.json', 'package.json');

console.log('\n📚 DOCUMENTATION');
checkFile('./README.md', 'README.md');
checkFile('./CUSTOMIZATION.md', 'CUSTOMIZATION.md');
checkFile('./DEPLOYMENT.md', 'DEPLOYMENT.md');
checkFile('./DEVELOPMENT.md', 'DEVELOPMENT.md');

console.log('\n⚙️  CONFIG FILES');
checkFile('./.htaccess', '.htaccess (optional)');
checkFile('./serve.js', 'serve.js (optional)');

console.log('\n🎬 IMAGE SEQUENCE');
checkDirectory('./sequence', 'sequence/', 192);

// ========================================
// CONTENT VALIDATION
// ========================================

console.log('\n✔️  CONTENT VALIDATION');

// Check HTML
const html = fs.readFileSync('./index.html', 'utf-8');
if (html.includes('<canvas')) {
    console.log('✅ Canvas element found');
    passCount++;
} else {
    console.log('❌ Canvas element missing');
    failCount++;
}

if (html.includes('beatA') && html.includes('beatB') && 
    html.includes('beatC') && html.includes('beatD')) {
    console.log('✅ All 4 beats found');
    passCount++;
} else {
    console.log('❌ Missing beats');
    failCount++;
}

// Check CSS
const css = fs.readFileSync('./style.css', 'utf-8');
if (css.includes('--bg-dark') && css.includes('--text-primary')) {
    console.log('✅ CSS variables defined');
    passCount++;
} else {
    console.log('❌ CSS variables missing');
    failCount++;
}

if (css.includes('.canvas-section')) {
    console.log('✅ Canvas section styling found');
    passCount++;
} else {
    console.log('❌ Canvas section styling missing');
    failCount++;
}

// Check JS
const js = fs.readFileSync('./script.js', 'utf-8');
if (js.includes('FRAME_COUNT') && js.includes('preloadImages')) {
    console.log('✅ Script configuration found');
    passCount++;
} else {
    console.log('❌ Script configuration missing');
    failCount++;
}

if (js.includes('handleScroll') && js.includes('requestAnimationFrame')) {
    console.log('✅ Animation logic found');
    passCount++;
} else {
    console.log('❌ Animation logic missing');
    failCount++;
}

// ========================================
// IMAGE SEQUENCE VALIDATION
// ========================================

console.log('\n🎞️  IMAGE SEQUENCE');

const sequenceDir = './sequence';
if (fs.existsSync(sequenceDir)) {
    const images = fs.readdirSync(sequenceDir)
        .filter(f => f.endsWith('.jpg') || f.endsWith('.webp'));
    
    if (images.length === 192) {
        console.log(`✅ All 192 frames present`);
        passCount++;
    } else if (images.length > 0) {
        console.log(`⚠️  ${images.length} frames found (expected 192)`);
        warnCount++;
    } else {
        console.log(`❌ No image files found`);
        failCount++;
    }
    
    // Check first frame
    const firstFrame = images.find(f => f.includes('frame_000') || f.includes('frame_0'));
    if (firstFrame) {
        const firstPath = path.join(sequenceDir, firstFrame);
        const stats = fs.statSync(firstPath);
        console.log(`✅ First frame: ${firstFrame} (${(stats.size / 1024).toFixed(2)}KB)`);
        passCount++;
    } else {
        console.log(`⚠️  First frame naming unclear`);
        warnCount++;
    }
    
    // Check last frame
    const lastFrame = images.find(f => f.includes('frame_191') || f.includes('frame_190'));
    if (lastFrame) {
        const lastPath = path.join(sequenceDir, lastFrame);
        const stats = fs.statSync(lastPath);
        console.log(`✅ Last frame exists: ${lastFrame}`);
        passCount++;
    } else {
        console.log(`⚠️  Last frame not clearly identified`);
        warnCount++;
    }
}

// ========================================
// SUMMARY
// ========================================

console.log('\n╔════════════════════════════════════════╗');
console.log('║  TEST SUMMARY                         ║');
console.log('╠════════════════════════════════════════╣');
console.log(`║ ✅ Passed: ${passCount}`);
console.log(`║ ⚠️  Warnings: ${warnCount}`);
console.log(`║ ❌ Failed: ${failCount}`);
console.log('╚════════════════════════════════════════╝\n');

// ========================================
// RECOMMENDATIONS
// ========================================

console.log('🚀 NEXT STEPS\n');

if (failCount === 0) {
    console.log('✨ Your portfolio is ready to launch!\n');
    
    console.log('1️⃣  Test locally:');
    console.log('   node serve.js');
    console.log('   Open: http://localhost:8080\n');
    
    console.log('2️⃣  Deploy:');
    console.log('   - Vercel:  vercel');
    console.log('   - Netlify: netlify deploy');
    console.log('   - GitHub:  git push\n');
    
    console.log('3️⃣  Optimize:');
    console.log('   - Run Lighthouse audit');
    console.log('   - Compress images further (optional)');
    console.log('   - Add analytics tracking\n');
    
    process.exit(0);
} else {
    console.log('⚠️  Please fix the issues above before deploying.\n');
    process.exit(1);
}
