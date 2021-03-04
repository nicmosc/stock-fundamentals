import cron from 'node-cron';

import { fetchDailyPrice } from './jobs';

export function jobsScheduler() {
  // Schedule daily price updates @18:00
  // cron.schedule('0 18 * * *', () => {
  cron.schedule('*/2 * * * *', () => {
    fetchDailyPrice();
  });

  // Schedule quarterly fundamentals
  cron.schedule('0 0 1 */3 *', () => {});
}
