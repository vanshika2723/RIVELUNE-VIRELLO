const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Admin Login
const adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured.",
      });
    }

    // Secure comparison helper
    const safeCompare = (input, stored) => {
      const inputBuffer = Buffer.from(input);
      const storedBuffer = Buffer.from(stored);

      if (inputBuffer.length !== storedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(inputBuffer, storedBuffer);
    };

    const isEmailValid = safeCompare(
      email.trim().toLowerCase(),
      adminEmail.trim().toLowerCase()
    );

    const isPasswordValid = safeCompare(
      password,
      adminPassword
    );

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        role: "admin",
        email: adminEmail,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

module.exports = {
  adminLogin,
};