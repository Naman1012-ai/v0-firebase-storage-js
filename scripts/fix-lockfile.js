const { execSync } = require('child_process');

try {
  console.log('Running pnpm install to regenerate lockfile...');
  execSync('pnpm install --no-frozen-lockfile', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('Lockfile regenerated successfully!');
} catch (error) {
  console.error('Error regenerating lockfile:', error.message);
  process.exit(1);
}
