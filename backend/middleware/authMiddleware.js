const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

const authMiddleware = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // RE-FETCH User from DB to get the most UP-TO-DATE role/info
        // This solves the stale token issue after subscription upgrades
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({ msg: 'User not found in database, access denied' });
        }

        req.user = user; // Now req.user is a Mongoose object with fresh data
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(401).json({ msg: 'Token is not valid or server error' });
    }
};

module.exports = authMiddleware;
