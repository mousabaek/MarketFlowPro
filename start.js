// Simple start script to run the application
import { execSync } from 'child_process';

console.log('Starting Wolf Auto Marketer application...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
}