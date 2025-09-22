const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting development server...');

// Initialize build state
let isBuilding = false;

// Function to run build
function runBuild() {
  isBuilding = true;
  console.log('🔨 Building site...');
  
  const buildSite = spawn('npm', ['run', 'build-site'], {
    stdio: 'inherit'
  });
  
  buildSite.on('close', (siteCode) => {
    if (siteCode === 0) {
      console.log('🔨 Building blog...');
      const buildBlog = spawn('npm', ['run', 'build-blog'], {
        stdio: 'inherit'
      });
      
      buildBlog.on('close', (blogCode) => {
        isBuilding = false;
        if (blogCode === 0) {
          console.log('✅ All builds complete! Refresh your browser to see changes.\n');
        } else {
          console.log('❌ Blog build failed!\n');
        }
      });
    } else {
      isBuilding = false;
      console.log('❌ Site build failed!\n');
    }
  });
}

// Initial build
console.log('📦 Running initial build...');
runBuild();

// Start file server
console.log('🌐 Starting local server at http://localhost:8080');
const server = spawn('npx', ['http-server', '.', '-p', '8080', '-c-1', '-s'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

// Only show server errors, not the startup messages
server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

console.log('✅ Server ready at: http://localhost:8080');

// Function to recursively find all files with specific extensions
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findFiles(filePath, extensions));
    } else {
      // Check if file has one of the desired extensions
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Find all files to watch
const filesToWatch = [
  ...findFiles('templates', ['.ejs']),
  ...findFiles('blog', ['.md']),
  'blog/build-blog.js',
  'build-site.js'
];

// Watch for changes in templates and markdown files
const watcher = chokidar.watch(filesToWatch, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher.on('ready', () => {
  console.log('👀 Watching for file changes...');
  const watched = watcher.getWatched();
  let fileCount = 0;
  Object.keys(watched).forEach(dir => {
    watched[dir].forEach(file => {
      if (file !== '.') {
        fileCount++;
        console.log(`   📁 ${path.join(dir, file)}`);
      }
    });
  });
  console.log(`   ✅ Watching ${fileCount} files\n`);
});

watcher.on('change', (filePath) => {
  if (isBuilding) {
    console.log('⏳ Build already in progress, skipping...');
    return;
  }
  
  console.log(`\n📝 File changed: ${path.relative(process.cwd(), filePath)}`);
  console.log('🔄 Rebuilding...');
  runBuild();
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  watcher.close();
  server.kill();
  process.exit();
});