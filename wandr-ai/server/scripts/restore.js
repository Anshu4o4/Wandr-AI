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

async function restore() {
  const dateArg = process.argv[2];
  if (!dateArg) {
    console.error('❌ Please provide a backup date: node scripts/restore.js YYYY-MM-DD');
    process.exit(1);
  }

  const TAR_FILE = `backup-${dateArg}.tar.gz`;
  const TAR_PATH = path.join(BACKUP_DIR, TAR_FILE);
  const EXTRACT_DIR = path.join(BACKUP_DIR, dateArg);

  try {
    console.log(`🔄 Starting restore for date: ${dateArg}...`);

    // 1. Create temporary directory
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

    // 2. Download from Cloudinary
    console.log('☁️ Downloading backup from Cloudinary...');
    // Cloudinary raw files are served via URL. Cloudinary API doesn't have a direct "download" but we can fetch it.
    // However, the simplest way for this script is to get the secure_url and use curl/fetch.
    const resource = await cloudinary.api.resource(`wandr-backups/${TAR_FILE}`, {
      resource_type: 'raw',
    });
    
    const downloadUrl = resource.secure_url;
    console.log(`🔗 Downloading from: ${downloadUrl}`);
    execSync(`curl -o ${TAR_PATH} ${downloadUrl}`);

    // 3. Extract tar.gz
    console.log('📤 Extracting backup files...');
    if (!fs.existsSync(EXTRACT_DIR)) fs.mkdirSync(EXTRACT_DIR);
    execSync(`tar -xzf ${TAR_PATH} -C ${BACKUP_DIR}`);

    // 4. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 5. Import collections
    const collections = ['users', 'trips', 'bookings', 'reviews'];
    for (const colName of collections) {
      const filePath = path.join(EXTRACT_DIR, `${colName}.json`);
      if (fs.existsSync(filePath)) {
        console.log(`📥 Restoring ${colName}...`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Clean collection before restore
        await mongoose.connection.db.collection(colName).deleteMany({});
        
        if (data.length > 0) {
          // Convert string IDs back to ObjectIds if necessary? 
          // JSON.parse keeps them as strings. Mongoose/MongoDB might need them as ObjectIds for indexing/relations.
          // But for a simple restore, importing the JSON objects works as MongoDB will handle them.
          // However, _id: { $oid: '...' } is common in mongoexport.
          // Here we have standard JSON objects.
          await mongoose.connection.db.collection(colName).insertMany(data);
        }
      } else {
        console.warn(`⚠️ Backup file for ${colName} not found, skipping.`);
      }
    }

    // 6. Cleanup
    console.log('🧹 Cleaning up temporary files...');
    fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
    fs.unlinkSync(TAR_PATH);

    console.log('🎉 Restore complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

restore();
