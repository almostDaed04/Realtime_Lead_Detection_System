require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

const promoteAdmin = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin -- <existing-user-email>');
    process.exitCode = 1;
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not configured. Add it to backend/.env first.');
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin' } },
      { new: true, runValidators: true }
    ).select('username email role');

    if (!user) {
      console.error('No account found for that email. Register and verify it first.');
      process.exitCode = 1;
      return;
    }

    console.log(`Admin access enabled for ${user.email}. Sign out and sign in again.`);
  } catch (error) {
    console.error(`Could not update account: ${error.name}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

promoteAdmin();
