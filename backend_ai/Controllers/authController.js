const jwt = require("jsonwebtoken");
const User = require("../Models/user");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, photoUrl, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      const token = signToken(exists);
      return res
        .status(200)
        .json({ message: "Welcome Back", user: exists, token });
    }

    const user = await User.create({ name, email, password, photoUrl, role });
    const token = signToken(user);
    return res.status(201).json({ message: "Registered", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    const userSafe = await User.findById(user._id);
    res.status(200).json({ message: "Logged in", user: userSafe, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};
