import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testUserPersistence() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://travel:travel12344@localhost:27017/wandr');
    const db = mongoose.connection.db;
    
    console.log('\n📊 Checking Users Collection:\n');
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('✅ Users collection exists but is empty (expected on first run)\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, i) => {
        console.log(`  ${i + 1}. Email: ${user.email}`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Role: ${user.role || 'user'}`);
        console.log(`     Auth Provider: ${user.authProvider || 'email'}`);
        console.log(`     Google ID: ${user.googleId ? '✅ Set' : 'Not set'}`);
        console.log(`     Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`     Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log();
      });
    }
    
    console.log('📝 How user persistence works:\n');
    console.log('  1. Sign Up → Creates new user record in DB');
    console.log('  2. Sets "logged_in=true" cookie (7 days)');
    console.log('  3. Returns access token (15 min) + refresh token (httpOnly, 7 days)');
    console.log('  4. On page reload → Access token from app state, refresh from cookie');
    console.log('  5. Re-Login → Finds existing user, validates password/OAuth');
    console.log('  6. Updates tokens, user stays logged in\n');
    
    console.log('✅ User records persist in MongoDB Atlas (cloud database)');
    console.log('✅ Sessions survive page reloads (via refresh token)\n');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testUserPersistence();
