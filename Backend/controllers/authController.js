const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        error: "Email already registered",
        status: 409,
      });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      data: { id: user._id, name: user.name, email: user.email },
      message: "User registered successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
        status: 400,
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        error: "Incorrect email or password",
        status: 401,
      });
    }

    const token = signToken(user);

    res.json({
      data: { token },
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};
