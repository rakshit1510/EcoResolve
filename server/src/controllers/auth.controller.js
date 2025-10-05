import User from "../models/user.model.js";

// Citizen Signup
export const signupCitizen = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      accountType: "Citizen",
      additionalDetails: req.body.additionalDetails,
    });

    res.status(201).json({ message: "Citizen registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Citizen Login
export const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, accountType: "Citizen" });

    if (!user) return res.status(404).json({ message: "Citizen not found" });

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, accountType: "Admin" });

    if (!user) return res.status(404).json({ message: "Admin not found" });

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .json({ message: "Admin login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Staff Login
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, accountType: "Staff" });

    if (!user) return res.status(404).json({ message: "Staff not found" });

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .status(200)
      .json({ message: "Staff login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
