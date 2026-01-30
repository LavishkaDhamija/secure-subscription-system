const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireAdminRole } = require('../middleware/aclMiddleware');
const User = require('../models/User');

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', auth, requireAdminRole, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
