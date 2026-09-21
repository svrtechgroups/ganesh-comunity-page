import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  console.log('Please run this only in development mode');
  process.exit(1);
}

const prisma = new PrismaClient();
const BATCH_SIZE = 100;

async function importCsvToDatabase() {
  const results: { id: string; fullName: any; email: any; phone: any; tier: any; role: any; status: any; profession: any; address: any; passwordHash: any; startDate: string; expiryDate: any; }[] = [];
  let index = 0;
  let batchCount = 0;

  const csvPath = fs.existsSync('./seeds/users.csv')
    ? './seeds/users.csv'
    : path.resolve(__dirname, '../seeds/users.csv');

  console.log(`Reading and parsing CSV file from: ${csvPath}`);

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      index++;
      // Dynamically generate ID as: FullName-1, FullName-2, etc.
      const generatedId = `${row.fullName}-${index}`;

      results.push({
        id: generatedId,
        fullName: generatedId,
        email: row.email,
        phone: row.phone,
        tier: row.tier,
        role: row.role,
        status: row.status,
        profession: row.profession,
        address: row.address,
        passwordHash: row.passwordHash,
        startDate: row.startDate,
        expiryDate: row.expiryDate,
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${results.length} records. Uploading in batches of ${BATCH_SIZE}...`);

      try {
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const chunk = results.slice(i, i + BATCH_SIZE);
          batchCount++;

          await prisma.member.createMany({
            data: chunk,
            skipDuplicates: true,
          });

          console.log(`-> Successfully uploaded batch ${batchCount} (${chunk.length} records)`);
        }

        console.log('✨ All batches uploaded successfully!');
      } catch (error) {
        console.error('Error uploading batch to database:', error);
      } finally {
        await prisma.$disconnect();
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
    });
}

importCsvToDatabase();