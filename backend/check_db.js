const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}, 'email username isVerified');
  console.log(users);
  process.exit(0);
}
test();
