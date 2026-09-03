const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const {
  sendVerificationEmail,
} = require('../utils/mailer');

/**
 * POST /api/auth/register
 * Create a new user account. Maps to F.1.
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        error: `An account with this ${field} already exists.`,
      });
    }

    // Create user (password hashing handled by pre-save hook)
    const user = new User({
      username,
      email,
      passwordHash: password,
      isVarified:false
    });

     const code = user.setVerificationCode();
    await user.save();

    await sendVerificationEmail(
      user.email,
      code
    );

    res.status(201).json({
       message:
        'Account created. Verification code sent to your email.',

      email: user.email,

      requiresVerification: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Verify password and send OTP.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include passwordHash for comparison)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ error: 'Account has been disabled. Contact an administrator.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

   //generate a new otp for login
   const code = user.setVerificationCode();

   await user.save();

   await sendVerificationEmail(
    user.email,
    code 
   );

    res.json({
      message: 'Verification code sent to your email.',
      email:user.email,
      requiresVerification: true,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /api/auth/verify-code
 * Verify OTP and generate JWT.
 */

const verifyCode = async(req,res,next) =>{
  try{
    const {email,code} = req.body;
    const user = await User.findOne({email}).select('+verificationCode +verificationCodeExpires');
    
    if(!user){
      return res.status(404).json({
        error:'User not found' 
      });
    }

    //verify otp
    const isValid = user.verifyCode(code);
    if(!isValid){
      return res.status(400).json({
        error:'invalid or expired verification code'
      });
    }

    //mark email as verified
    user.isVarified = true;

    //remove otp after successful verification
    user.verificationCode = undefined;

    user.verificationCodeExpires = undefined;

    await user.save();

    const token = generateToken(user);

    res.json({
      message:'Verification successful',
      token,
      user: user.toJSON()
    });
  }
catch (error) {

    next(error);

  }

    
}

/**
 * POST /api/auth/resend-code
 * Generate and send a new OTP.
 */

const resendCode = async(req,res,next)=>{
   try{const {email} = req.body;

   const user = await User.findOne(email);

   if(!user){
      return res.status(404).json({
        error: 'User not found.',
      });
   }

   //generate new otp
   await sendVerificationEmail(
      user.email,
      code
    );


    res.json({

      message:
        'A new verification code has been sent.',

    });}
    catch (error) {

    next(error);

  }
}






/**
 * GET /api/auth/me
 * Get current user profile. Requires authentication.
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {

  register,

  login,

  verifyCode,

  resendCode,

  getMe,

};
