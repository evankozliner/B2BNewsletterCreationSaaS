const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development server...');

// Initialize build state
let isBuilding = false;

// Function to run build
function runBuild() {
  isBuilding = true;
  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit'
  });
  
  build.on('close', (code) => {
    isBuilding = false;
    if (code === 0) {
      console.log('✅ Build complete! Refresh your browser to see changes.\n');
    } else {
      console.log('❌ Build failed!\n');
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

// Watch for changes in templates and markdown files
const watcher = chokidar.watch([
  'templates/**/*.ejs',
  'blog/**/*.md',
  'blog/build-blog.js',
  'build-site.js'
], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
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