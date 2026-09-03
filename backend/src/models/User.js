const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  verificationCode: {
  type: String,
  select: false, 
},
verificationCodeExpires: {
  type: Date,
  select: false,
},
isVerified: {
  type: Boolean,
  default: false,
},
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};


// Generate verification code
userSchema.methods.setVerificationCode = function () {

  // Generate a 6-digit OTP
  const code = crypto
    .randomInt(100000, 1000000)
    .toString();


  // Store only the hashed OTP
  this.verificationCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');


  // OTP expires after 10 minutes
  this.verificationCodeExpires =
    new Date(
      Date.now() + 10 * 60 * 1000
    );


  // Return plain OTP so it can be sent by email
  return code;

};

// Verify the OTP entered by the user
userSchema.methods.verifyCode = function (
  candidateCode
) {

  if (
    !this.verificationCode ||
    !this.verificationCodeExpires
  ) {
    return false;
  }


  // Check whether OTP has expired
  if (
    this.verificationCodeExpires < Date.now()
  ) {
    return false;
  }


  // Hash the code entered by the user
  const hashedCode = crypto
    .createHash('sha256')
    .update(candidateCode)
    .digest('hex');


  // Compare hashed values
  return (
    hashedCode === this.verificationCode
  );

};
// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
