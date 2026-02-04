const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        // Clear existing users and recreate test accounts
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('password', 10);

        const testUsers = [
            // Ward 4 users
            {
                email: 'citizen@test.com',
                password: hashedPassword,
                name: 'Test Citizen',
                role: 'CITIZEN',
                houseNumber: 'H001',
                wardNumber: '4',
                area: 'Bhetapara - Lane 1',
                location: { lat: 26.1445, lng: 91.7362 },
            },
            {
                email: 'collector@test.com',
                password: hashedPassword,
                name: 'Test Collector',
                role: 'COLLECTOR',
                wardNumber: '4',
            },

            // Ward 1 users (for testing ward isolation)
            {
                email: 'citizen.w1@test.com',
                password: hashedPassword,
                name: 'Ward 1 Citizen',
                role: 'CITIZEN',
                houseNumber: 'W1-001',
                wardNumber: '1',
                area: 'Ward 1 Area A',
                location: { lat: 26.1500, lng: 91.7400 },
            },
            {
                email: 'collector.w1@test.com',
                password: hashedPassword,
                name: 'Ward 1 Collector',
                role: 'COLLECTOR',
                wardNumber: '1',
            },

            // Admin user
            {
                email: 'admin@test.com',
                password: hashedPassword,
                name: 'Municipal Admin',
                role: 'ADMIN',
            },
        ];

        await User.insertMany(testUsers);
        console.log('✅ Test users seeded successfully');
        console.log('Login credentials:');
        console.log('  Ward 4 Citizen: citizen@test.com / password');
        console.log('  Ward 4 Collector: collector@test.com / password');
        console.log('  Ward 1 Citizen: citizen.w1@test.com / password');
        console.log('  Ward 1 Collector: collector.w1@test.com / password');
        console.log('  Admin: admin@test.com / password');
    } catch (err) {
        console.error('Error seeding users:', err);
    }
}

module.exports = { seedUsers };
