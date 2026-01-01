import User from '../Models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const { email, password, usertype } = req.body;
  if (!['admin', 'superadmin'].includes(usertype)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ email, password, usertype });
  res.status(201).json({ _id: user._id, email: user.email, usertype: user.usertype });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { email, password, usertype } = req.body;
  if (email) user.email = email;
  if (password) user.password = password;
  if (usertype && ['admin', 'superadmin'].includes(usertype)) user.usertype = usertype;
  await user.save();
  res.json({ _id: user._id, email: user.email, usertype: user.usertype });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
});