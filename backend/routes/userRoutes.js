const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
  try {
  
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// In your userRoutes.js or similar file
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  console.log('Registration started at:', new Date().toISOString());
  
  try {
    const { name, email, password, phone } = req.body;
    console.log('Registration attempt:', { email });
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    console.log('Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    console.log('Creating user...');
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer'
    });
    
    console.log('Saving user...');
    await user.save();
    
    // Generate token
    console.log('Generating token...');
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    const endTime = Date.now();
    console.log('Registration completed in:', endTime - startTime, 'ms');
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
    
  } catch (error) {
    const endTime = Date.now();
    console.error('Registration error after', endTime - startTime, 'ms:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.route('/')
  .get(protect, authorize('admin'), getAllUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/role', protect, authorize('admin'), updateUserRole);


router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); 
    console.log('Fetched users:', users); 
    res.json(users); 
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;