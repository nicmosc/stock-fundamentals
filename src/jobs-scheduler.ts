import cron from 'node-cron';

import { computeFundamentals, fetchDailyPrice, fetchSymbolsList } from './jobs';

export function jobsScheduler() {
  console.log('The current time is ', new Date());
  // Schedule daily price updates @18:00
  console.log('Daily Price schedule active...');
  cron.schedule('10 10 * * *', () => {
    fetchDailyPrice();
  });

  // Schedule quarterly fundamentals
  console.log('Quarterly Fundamentals schedule active...');
  cron.schedule('0 0 1 */3 *', async () => {
    const res = await fetchSymbolsList();
    if (res != null) {
      computeFundamentals();
    }
  });
}
