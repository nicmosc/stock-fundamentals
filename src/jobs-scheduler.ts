import { CronJob } from 'cron';

import { computeFundamentals, fetchDailyPrice, fetchSymbolsList } from './jobs';

export function jobsScheduler() {
  // Schedule daily price updates @18:00
  console.log('Daily Price schedule active...');
  const price = new CronJob('10 10 * * *', () => {
    fetchDailyPrice();
  });

  // Schedule quarterly fundamentals
  console.log('Quarterly Fundamentals schedule active...');
  const fundamentals = new CronJob('0 0 1 */3 *', async () => {
    const res = await fetchSymbolsList();
    if (res != null) {
      computeFundamentals();
    }
  });

  price.start();
  fundamentals.start();
}
