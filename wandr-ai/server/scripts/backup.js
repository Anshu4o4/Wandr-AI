import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const TIMESTAMP = new Date().toISOString().split('T')[0];
const CURRENT_BACKUP_DIR = path.join(BACKUP_DIR, TIMESTAMP);
const TAR_FILE = `backup-${TIMESTAMP}.tar.gz`;
const TAR_PATH = path.join(BACKUP_DIR, TAR_FILE);

const collections = ['users', 'trips', 'bookings', 'reviews'];

async function backup() {
  try {
    console.log('🚀 Starting manual backup...');

    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create backup directories
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    if (!fs.existsSync(CURRENT_BACKUP_DIR)) fs.mkdirSync(CURRENT_BACKUP_DIR);

    // 3. Export collections
    for (const colName of collections) {
      console.log(`📦 Exporting ${colName}...`);
      const data = await mongoose.connection.db.collection(colName).find({}).toArray();
      fs.writeFileSync(
        path.join(CURRENT_BACKUP_DIR, `${colName}.json`),
        JSON.stringify(data, null, 2)
      );
    }

    // 4. Compress to tar.gz
    console.log('🤐 Compressing backup files...');
    execSync(`tar -czf ${TAR_PATH} -C ${BACKUP_DIR} ${TIMESTAMP}`);

    // 5. Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(TAR_PATH, {
      folder: 'wandr-backups',
      resource_type: 'raw',
      public_id: TAR_FILE,
      overwrite: true,
    });

    console.log('✅ Backup uploaded successfully:', uploadResult.secure_url);

    // 6. Cleanup
    console.log('🧹 Cleaning up local backup files...');
    fs.rmSync(CURRENT_BACKUP_DIR, { recursive: true, force: true });
    fs.unlinkSync(TAR_PATH);

    console.log('🎉 Backup process complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

backup();
