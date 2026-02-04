const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Register new user
async function register(req, res, next) {
    try {
        console.log('Registration request received:', req.body);
        const { email, password, name, role, houseNumber, wardNumber, area, location } = req.body;

        // Basic validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({
                message: 'Email, password, name, and role are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate role-specific requirements
        if (role === 'CITIZEN') {
            if (!houseNumber || !wardNumber) {
                return res.status(400).json({
                    message: 'House number and ward number are required for citizen registration'
                });
            }
        }

        if (role === 'COLLECTOR') {
            if (!wardNumber) {
                return res.status(400).json({
                    message: 'Ward number is required for collector registration'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with role-specific fields
        const userData = {
            email,
            password: hashedPassword,
            name,
            role,
            wardNumber,
        };

        // Add citizen-specific fields
        if (role === 'CITIZEN') {
            userData.houseNumber = houseNumber;
            userData.area = area;
            userData.location = location;
        }

        const user = await User.create(userData);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                houseNumber: user.houseNumber,
                wardNumber: user.wardNumber,
                area: user.area,
                location: user.location,
            },
        });
    } catch (err) {
        console.error('Registration error:', err);
        next(err);
    }
}

// Login user
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                houseNumber: user.houseNumber,
                wardNumber: user.wardNumber,
                area: user.area,
                location: user.location,
            },
        });
    } catch (err) {
        next(err);
    }
}

// Get current user
async function me(req, res, next) {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            houseNumber: user.houseNumber,
            wardNumber: user.wardNumber,
            area: user.area,
            location: user.location,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register,
    login,
    me,
};
