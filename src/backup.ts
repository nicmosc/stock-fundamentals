import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import aws from 'aws-sdk';
import { CronJob } from 'cron';
import urlJoin from 'url-join';

export const BACKUP_PATH = '../dump/stock-fundamentals';

const uploadFile = async (filePath: string, fileName: string, targetFolder: string) => {
  // S3 upload
  aws.config.update({ region: 'eu-central-1' });

  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  console.log(`Uploading ${fileName} to S3...`);

  // File
  const fileStream = fs.createReadStream(urlJoin(filePath, fileName));

  fileStream.on('error', (fsErr) => {
    console.log('File Error', fsErr);
  });

  // Payload
  const uploadParams = {
    Bucket: 'stock-fundamentals-backups',
    Key: urlJoin(targetFolder, fileName),
    Body: fileStream,
  };

  // Upload
  s3.upload(uploadParams, (error: Error, data: aws.S3.ManagedUpload.SendData) => {
    if (error != null) {
      console.log('S3 Error: ', error);
    }
    if (data) {
      console.log(`Uploaded ${fileName} with success`, data.Location);
    }
  });
};

export function backup() {
  // Backup everyday @01:00
  console.log('Daily backup schedule active...');
  const backup = new CronJob('0 1 * * *', () => {
    try {
      // Backup mongo dump
      execSync(`mongodump --verbose --uri ${process.env.MONGODB_URI}`);
      console.log('Mongo Backup created');

      const today = new Date();
      const targetFolder = `${today.getFullYear()}-${String(today.getMonth()).padStart(
        2,
        '0',
      )}-${String(today.getDay()).padStart(2, '0')}`;

      uploadFile(path.join(__dirname, BACKUP_PATH), 'symbols.bson', targetFolder);
      uploadFile(path.join(__dirname, BACKUP_PATH), 'stocks.bson', targetFolder);
    } catch (err) {
      console.error('Something went wrong backing up the database: ', err);
    }
  });

  backup.start();
}
