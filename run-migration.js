import { execSync } from 'child_process';

try {
  console.log('Running database migration with --force flag...');
  execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
  console.log('Migration completed successfully');
} catch (error) {
  console.error('Error running migration:', error);
  process.exit(1);
}