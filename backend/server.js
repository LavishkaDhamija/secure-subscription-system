const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(db)
    .then(() => {
        console.log('MongoDB Connected');
        seedData();
    })
    .catch(err => console.log(err));

const { generateRSAKeyPair } = require('./utils/cryptoUtils');

// Generate RSA Keys for the session
const serverKeys = generateRSAKeyPair();
console.log('[CRYPTO] RSA Key Pair Generated');

const cryptoRoutes = require('./routes/cryptoRoutes')(serverKeys);

// Use Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/crypto', cryptoRoutes);

// Share cryptoRoutes for other routes to access session keys
app.set('cryptoRoutes', cryptoRoutes);
app.set('serverKeys', serverKeys);

// Data Migration & Normalization
const migrateData = async () => {
    try {
        const User = require('./models/User');
        const users = await User.find({
            $or: [
                { role: { $in: ['Free', 'Premium', 'free', 'premium'] } },
                { subscriptionPlan: { $in: ['Free', 'Premium', 'free', 'premium'] } }
            ]
        });

        if (users.length > 0) {
            console.log(`[Migration] Normalizing ${users.length} users to uppercase enums...`);
            for (let user of users) {
                user.role = user.role.toUpperCase();
                user.subscriptionPlan = user.subscriptionPlan.toUpperCase();
                await user.save();
            }
            console.log('[Migration] User data normalized.');
        }

        // Also normalize admin if it was accidentally title case
        await User.updateMany({ role: 'admin' }, { role: 'ADMIN' });

    } catch (err) {
        console.error('[Migration Error]', err);
    }
};

// Seed Data (Dummy data)
const seedData = async () => {
    try {
        await migrateData(); // Run migration before seeding

        const SubscriptionPlan = require('./models/SubscriptionPlan');
        const Feature = require('./models/Feature');

        // Seed Plans
        const plansCount = await SubscriptionPlan.countDocuments();
        if (plansCount === 0) {
            await SubscriptionPlan.create([
                { name: 'FREE', price: 0, featuresAllowed: ['Basic Access'] },
                { name: 'PREMIUM', price: 20, featuresAllowed: ['Basic Access', 'Premium Content', 'Priority Support'] }
            ]);
            console.log('Plans seeded');
        }

        // Seed Features
        const featureCount = await Feature.countDocuments();
        if (featureCount === 0) {
            await Feature.create([
                { featureName: 'Basic Dashboard', accessLevel: 'ALL' },
                { featureName: 'Premium Analytics', accessLevel: 'PREMIUM_ONLY' },
                { featureName: 'User Management', accessLevel: 'ADMIN_ONLY' }
            ]);
            console.log('Features seeded');
        }
    } catch (err) {
        console.error('[Seeding Error]', err);
    }
};

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
