// controllers/auth.js
import User from '../Models/User.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, usertype } = req.body;
  if (!['admin', 'superadmin'].includes(usertype)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ email, password, usertype });
  const token = jwt.sign({ id: user._id, usertype: user.usertype }, process.env.JWT_SECRET, { expiresIn: '3h' });
  res.status(201).json({ _id: user._id, email: user.email, usertype: user.usertype, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ id: user._id, usertype: user.usertype }, process.env.JWT_SECRET, { expiresIn: '3h' });
    res.json({ _id: user._id, email: user.email, usertype: user.usertype, token });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Force usertype to superadmin
  const usertype = 'superadmin';

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ email, password, usertype });

  const token = jwt.sign(
    { id: user._id, usertype: user.usertype },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    _id: user._id,
    email: user.email,
    usertype: user.usertype,
    token,
  });
});
