import { generateAndSaveRssData } from '../src/app/api/cron/generate-rss/route';

async function runGeneration() {
  console.log('Starting RSS data generation for build...');
  try {
    const result = await generateAndSaveRssData();
    console.log('RSS data generation complete:', result);
  } catch (error) {
    console.error('Error during RSS data generation for build:', error);
    process.exit(1); // Exit with an error code
  }
}

runGeneration();