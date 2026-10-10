const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  console.log("All stranded users deleted.");
  process.exit(0);
}
test();
