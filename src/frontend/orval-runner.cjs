const { execSync } = require('child_process');

process.env.NODE_OPTIONS = '--experimental-json-modules';

execSync('npx orval --config ./orval.config.cjs', {
  stdio: 'inherit',
  cwd: __dirname
});
