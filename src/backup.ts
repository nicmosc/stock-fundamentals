import { execSync } from 'child_process';
import fs from 'fs';

import aws from 'aws-sdk';
import cron from 'node-cron';
// import path from 'path';

const uploadFile = async (filePath: string, fileName: string, targetFolder: string) => {
  // S3 upload
  aws.config.update({ region: 'eu-central-1' });

  const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  console.log(`Uploading ${fileName} to S3...`);

  // File
  const fileStream = fs.createReadStream(`${filePath}/${fileName}`);

  fileStream.on('error', (fsErr) => {
    console.log('File Error', fsErr);
  });

  // Payload
  const uploadParams = {
    Bucket: 'stock-fundamentals-backups',
    Key: `${targetFolder}/${fileName}`,
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
  // cron.schedule('0 9 * * *', () => {
  cron.schedule('*/2 * * * *', () => {
    try {
      // Backup mongo dump
      execSync(`mongodump --verbose --uri ${process.env.MONGODB_URI}`);
      console.log('Mongo Backup created');

      const today = new Date();
      const targetFolder = `${today.getFullYear()}-${String(today.getMonth()).padStart(
        2,
        '0',
      )}-${String(today.getDay()).padStart(2, '0')}`;

      uploadFile('/dump/stock-fundamentals', 'symbols.bson', targetFolder);
      uploadFile('/dump/stock-fundamentals', 'stocks.bson', targetFolder);
    } catch (err) {
      console.error('Something went wrong backing up the database: ', err);
    }
  });
}
