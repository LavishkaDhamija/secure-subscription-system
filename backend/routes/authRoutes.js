const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    console.log('[REGISTER] Payload:', { username, email, password: '***' });
    try {
        let user = await User.findOne({ email });

        if (user) {
            console.log('[REGISTER] FOUND EXISTING USER:', user._id, user.email);
            return res.status(400).json({ msg: `User already exists (ID: ${user._id})` });
        }

        console.log('[HASHING] Plain Password provided:', password);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('[HASHING] Hashed Password to store:', hashedPassword);

        user = new User({
            username,
            email,
            password: hashedPassword
        });

        console.log('[REGISTER] Saving user to DB...');
        await user.save();
        console.log('[REGISTER] User saved ID:', user.id);

        res.json({ msg: 'User registered successfully. Please login with MFA.' });
    } catch (err) {
        console.error('[REGISTER ERROR]', err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// @route   POST api/auth/login
// @desc    Authenticate user & generate OTP
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('[LOGIN] Attempting login for:', email);

    try {
        let user = await User.findOne({ email });

        if (!user) {
            console.log('[LOGIN] User not found during login');
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Placeholder: Compare hashed password
        console.log('[AUTH] Verifying password match...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('[AUTH] Password match result:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate matching OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpires = Date.now() + 300000; // 5 minutes
        await user.save();

        console.error('\n==================================================');
        console.error(`[MFA] OTP for ${user.email}: ${otp}`);
        console.error('==================================================\n');

        res.json({ msg: 'OTP sent', userId: user.id, otpRequired: true });
    } catch (err) {
        console.error('[LOGIN ERROR]', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and get token
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or Expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, role: user.role, subscriptionPlan: user.subscriptionPlan } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
const authMiddleware = require('../middleware/authMiddleware');
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
