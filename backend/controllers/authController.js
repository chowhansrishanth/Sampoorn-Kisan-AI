const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { isDbOperational } = require("../config/db");
const conversationMemory = require("../services/conversationMemory");
const fs = require("fs");
const path = require("path");

const { JWT_SECRET } = require('../config/security');

// â”€â”€â”€ File-Backed Persistent User Store (fallback when MongoDB is unavailable/restricted) â”€â”€â”€
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users_store.json");

if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const memUsers = new Map(); // email/phone/id â†’ user object

const loadUsersFromDisk = () => {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const raw = fs.readFileSync(USERS_FILE, "utf8");
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                list.forEach(u => {
                    if (u && u.id) memUsers.set(u.id, u);
                    if (u && u.email) memUsers.set(u.email.toLowerCase().trim(), u);
                    if (u && u.phone) memUsers.set(u.phone.trim(), u);
                });
                console.log(`ðŸ’¾ Restored ${list.length} persistent user accounts from disk store (${USERS_FILE}).`);
            }
        }
    } catch (err) {
        console.error("Failed to load persistent users from disk:", err.message);
    }
};

const persistUsersToDisk = () => {
    try {
        const uniqueUsers = [];
        const seenIds = new Set();
        for (const [, u] of memUsers) {
            if (u && u.id && !seenIds.has(u.id)) {
                seenIds.add(u.id);
                uniqueUsers.push(u);
            }
        }
        const tempPath = path.join(DATA_DIR, `users_store.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
        fs.writeFileSync(tempPath, JSON.stringify(uniqueUsers, null, 2), "utf8");
        try {
            fs.renameSync(tempPath, USERS_FILE);
        } catch (_) {
            fs.copyFileSync(tempPath, USERS_FILE);
            try { fs.unlinkSync(tempPath); } catch (e) { void e; }
        }
    } catch (err) {
        console.error("Failed to save users to disk store:", err.message);
    }
};

// Initialize disk store on server load
if (process.env.NODE_ENV !== "production") loadUsersFromDisk();

const memFindByEmail = (identifier) => {
    if (!identifier) return null;
    const lower = String(identifier).toLowerCase().trim();
    for (const [, u] of memUsers) {
        if (!u) continue;
        const uEmail = (u.email || "").toLowerCase().trim();
        const uPhone = (u.phone || "").trim();
        if (uEmail === lower || uPhone === lower || (lower.includes("@") && uEmail === lower)) {
            return u;
        }
    }
    return null;
};

const memFindById = (id) => memUsers.get(id) || null;

const memSave = (user) => {
    if (process.env.NODE_ENV === "production") return user;
    if (user && user.id) memUsers.set(user.id, user);
    if (user && user.email) memUsers.set(user.email.toLowerCase().trim(), user);
    if (user && user.phone) memUsers.set(user.phone.trim(), user);
    persistUsersToDisk();
    return user;
};


// â”€â”€â”€ DB helper: try Mongo, fall back to in-memory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const isMongoError = (err) => {
    if (!err) return false;
    const msg = (err?.message || "").toLowerCase();
    const name = (err?.name || "").toLowerCase();
    const code = err?.code;
    return (
        name.includes("mongo") ||          // MongoError, MongoServerError, etc.
        code === 13 ||                      // Unauthorized
        code === 18 ||                      // AuthenticationFailed
        code === 391 ||                     // ReauthenticationRequired
        msg.includes("authentication") ||
        msg.includes("requires auth") ||
        msg.includes("not authorized") ||
        msg.includes("unauthorized") ||
        msg.includes("command find") ||    // "Command find requires authentication"
        msg.includes("command insert") ||
        msg.includes("buffertimeout") ||
        msg.includes("topology") ||
        msg.includes("econnrefused") ||
        msg.includes("connect etimedout")
    );
};


// â”€â”€â”€ Helpers: User Sanitization, Auth Cookies & Timing-Safe Dummy Hash â”€â”€â”€â”€â”€â”€â”€â”€
const DUMMY_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoOeV25hP6/x75L6YF3Hk3Q6k4y2c1t1C2";

const sanitizeUser = (u) => {
    if (!u) return null;
    const id = u._id ? u._id.toString() : (u.id ? u.id.toString() : undefined);
    return {
        id,
        _id: id,
        name: u.name || "Farmer",
        email: u.email || "",
        phone: u.phone || "",
        location: u.location || "Punjab, India",
        locationObj: u.locationObj || null,
        cropType: u.cropType || "Wheat & Rice",
        farmSizeHectares: u.farmSizeHectares || 2.5,
        farmProfile: u.farmProfile || null,
        preferredLanguage: u.preferredLanguage || "English",
        role: u.role || "farmer",
        fcmToken: u.fcmToken || null
    };
};

const setAuthCookie = (res, token, rememberMe = true) => {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });
};

const clearAuthCookie = (res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/"
    });
};

const pendingRegistrations = new Set();

// â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const register = async (req, res) => {
    let reservedEmail = null;
    let reservedPhone = null;
    try {
        const { name, email, phone, password, confirmPassword, location, cropType } = req.body || {};

        // Type safety guard against array/object payload abuse
        if (
            (name && typeof name !== "string") ||
            (email && typeof email !== "string") ||
            (phone && typeof phone !== "string") ||
            (password && typeof password !== "string") ||
            (confirmPassword && typeof confirmPassword !== "string")
        ) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Please enter valid text for registration fields.",
                error: "Invalid input types"
            });
        }

        const cleanName = (name || "").trim();
        const cleanPassword = (password || "");
        const cleanConfirm = (confirmPassword || "");
        const cleanPhone = (phone || "").trim();
        const cleanEmail = (email || "").toLowerCase().trim();

        // 1. Validate required fields & length bounds
        if (!cleanName || cleanName.length < 2 || cleanName.length > 70) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Please enter a valid full name (2-70 characters).",
                error: "Full name is required (2-70 characters)"
            });
        }

        if (!cleanEmail && !cleanPhone) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Please provide an email address or mobile number.",
                error: "Email or mobile number required"
            });
        }

        if (cleanEmail && cleanEmail.length > 254) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Email address cannot exceed 254 characters.",
                error: "Email too long"
            });
        }

        if (cleanEmail) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_INPUT",
                    message: "Please enter a valid email address format.",
                    error: "Invalid email format"
                });
            }
        }

        if (cleanPhone) {
            const phoneDigits = cleanPhone.replace(/[^0-9]/g, "");
            if (phoneDigits.length < 10 || phoneDigits.length > 15) {
                return res.status(400).json({
                    success: false,
                    code: "INVALID_INPUT",
                    message: "Please enter a valid 10-digit mobile number.",
                    error: "Invalid phone number"
                });
            }
        }

        if (!cleanPassword || cleanPassword.length < 8 || Buffer.byteLength(cleanPassword) > 72) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Password must be at least 8 characters and at most 72 UTF-8 bytes.",
                error: "Password length out of bounds"
            });
        }

        if (cleanConfirm && cleanPassword !== cleanConfirm) {
            return res.status(400).json({
                success: false,
                code: "PASSWORD_MISMATCH",
                message: "Passwords do not match.",
                error: "Passwords do not match."
            });
        }

        const effectiveEmail = cleanEmail || `${cleanPhone}@kisan.ai`;

        // Check pending in-flight registration lock
        if (pendingRegistrations.has(effectiveEmail) || (cleanPhone && pendingRegistrations.has(cleanPhone))) {
            return res.status(400).json({
                success: false,
                code: "USER_ALREADY_EXISTS",
                message: "User already exists",
                error: "User already exists"
            });
        }

        // Reserve registration key atomically
        pendingRegistrations.add(effectiveEmail);
        reservedEmail = effectiveEmail;
        if (cleanPhone) {
            pendingRegistrations.add(cleanPhone);
            reservedPhone = cleanPhone;
        }

        // â”€â”€ Check if already registered in MongoDB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (isDbOperational()) {
            try {
                const existingUser = await User.findOne({
                    $or: [
                        { email: effectiveEmail },
                        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
                    ]
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        code: "USER_ALREADY_EXISTS",
                        message: "User already exists",
                        error: "User already exists"
                    });
                }

                const hashedPassword = await bcrypt.hash(cleanPassword, 10);
                const newUser = new User({
                    name: cleanName,
                    email: effectiveEmail,
                    phone: cleanPhone,
                    password: hashedPassword,
                    location: location || "Punjab, India",
                    cropType: cropType || "Wheat & Rice",
                    farmSizeHectares: 2.5
                });
                await newUser.save();


                memSave({
                    id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    password: hashedPassword,
                    location: newUser.location,
                    cropType: newUser.cropType
                });


                return res.status(201).json({
                    success: true,
                    code: "REGISTER_SUCCESS",
                    message: "Account created successfully. Please sign in.",
                    user: sanitizeUser(newUser)
                });
            } catch (dbErr) {
                if (dbErr.code === 11000 || dbErr.message.includes("E11000") || dbErr.message.includes("duplicate key")) {
                    return res.status(400).json({
                        success: false,
                        code: "USER_ALREADY_EXISTS",
                        message: "User already exists",
                        error: "User already exists"
                    });
                }
                console.warn("âš ï¸ MongoDB register failed, using in-memory:", dbErr.message);
            }
        }

        // â”€â”€ In-Memory check & register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (process.env.NODE_ENV === 'production') return res.status(503).json({ success: false, error: 'Account storage is temporarily unavailable.' });
        if (memFindByEmail(effectiveEmail) || (cleanPhone && memFindByEmail(cleanPhone))) {
            return res.status(400).json({
                success: false,
                code: "USER_ALREADY_EXISTS",
                message: "User already exists",
                error: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(cleanPassword, 10);
        const memId = crypto.randomBytes(12).toString("hex");
        const memUser = {
            id: memId,
            name: cleanName,
            email: effectiveEmail,
            phone: cleanPhone,
            password: hashedPassword,
            location: location || "Punjab, India",
            cropType: cropType || "Wheat & Rice",
            farmSizeHectares: 2.5,
            preferredLanguage: "English"
        };
        memSave(memUser);


        return res.status(201).json({
            success: true,
            code: "REGISTER_SUCCESS",
            message: "Account created successfully. Please sign in.",
            user: sanitizeUser(memUser)
        });

    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            message: "Unable to create account right now. Please try again.",
            error: "Registration failed"
        });
    } finally {
        if (reservedEmail) pendingRegistrations.delete(reservedEmail);
        if (reservedPhone) pendingRegistrations.delete(reservedPhone);
    }
};

// â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const login = async (req, res) => {
    try {
        const { email, password, identifier, phone, rememberMe = true } = req.body || {};

        // Type safety checks against object/array injection
        if (
            (identifier && typeof identifier !== "string") ||
            (email && typeof email !== "string") ||
            (phone && typeof phone !== "string") ||
            (password && typeof password !== "string")
        ) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Please enter your email/mobile number and password.",
                error: "Invalid input format"
            });
        }

        const rawId = (identifier || email || phone || "").trim();
        const pass = (password || "");

        // 1. Strict validation against missing / whitespace-only / oversized inputs
        if (!rawId || !pass || pass.trim() === "" || rawId.length > 254 || pass.length > 128) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                message: "Please enter your email/mobile number and password.",
                error: "Email or mobile number and password are required and must be within length limits"
            });
        }

        const inputLC = rawId.toLowerCase();
        let targetUser = null;
        let isMongo = false;

        // 2. Lookup in MongoDB
        if (isDbOperational()) {
            try {
                targetUser = await User.findOne({
                    $or: [
                        { email: inputLC },
                        { phone: rawId }
                    ]
                });
                if (targetUser) isMongo = true;
            } catch (dbErr) {
                if (process.env.NODE_ENV === 'production') return res.status(503).json({ success: false, error: 'Account storage is temporarily unavailable.' });
            }
        }

        // 3. Lookup in In-Memory Store
        if (!targetUser) {
            targetUser = memFindByEmail(inputLC);
        }

        // 4. Timing-attack prevention: perform dummy comparison if user not found
        if (!targetUser) {
            await bcrypt.compare(pass, DUMMY_HASH);
            return res.status(401).json({
                success: false,
                code: "INVALID_CREDENTIALS",
                message: "Invalid email/mobile number or password.",
                error: "Invalid email/mobile number or password."
            });
        }

        // 5. Verify password
        let isMatch = false;
        if (targetUser.password) {
            try {
                isMatch = await bcrypt.compare(pass, targetUser.password);
            } catch {
                isMatch = false;
            }
        } else {
            isMatch = false;
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: "INVALID_CREDENTIALS",
                message: "Invalid email/mobile number or password.",
                error: "Invalid email/mobile number or password."
            });
        }

        // 6. Generate JWT and Auth Cookie with explicit algorithm
        const userId = isMongo ? targetUser._id.toString() : targetUser.id;
        const token = jwt.sign(
            { id: userId, email: targetUser.email, mem: !isMongo, sv: targetUser.sessionVersion || 0 },
            JWT_SECRET,
            { expiresIn: rememberMe ? "7d" : "24h", algorithm: "HS256" }
        );

        setAuthCookie(res, token, rememberMe);

        return res.json({
            success: true,
            code: "LOGIN_SUCCESS",
            message: "Login successful",
            user: sanitizeUser(targetUser),
            token
        });

    } catch (err) {
        console.error("Login handler exception:", err);
        return res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            message: "Unable to sign in right now. Please try again.",
            error: "Login failed"
        });
    }
};

// â”€â”€ Forgot Password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const forgotPassword = async (req, res) => {
    try {
        const { email, identifier } = req.body || {};
        if (
            (email && typeof email !== "string") ||
            (identifier && typeof identifier !== "string")
        ) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                error: "Invalid input format",
                message: "Please enter your registered email address."
            });
        }

        const rawTarget = (email || identifier || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawTarget) || rawTarget.length > 254) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                error: "Email address is required",
                message: "Please enter your registered email address."
            });
        }

        const targetLC = rawTarget.toLowerCase();
        if (process.env.NODE_ENV !== 'test' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
            return res.status(503).json({ success: false, error: 'Password reset email delivery is unavailable. Please try again later.' });
        }
        let user = null;
        let isMongo = false;

        // Try MongoDB
        if (isDbOperational()) {
            try {
                user = await User.findOne({
                    $or: [
                        { email: targetLC },
                        { phone: rawTarget }
                    ]
                });
                if (user) isMongo = true;
            } catch (dbErr) {
                if (!isMongoError(dbErr)) throw dbErr;
            }
        }

        // Try in-memory store
        if (!user) {
            user = memFindByEmail(targetLC);
        }

        let resetToken = null;
        // If user exists, generate cryptographically secure reset token
        if (user) {
            resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            const expires = Date.now() + 15 * 60 * 1000; // 15 minutes strict expiration

            if (isMongo) {
                await User.updateOne({ _id: user._id }, { $set: { resetPasswordToken: hashedToken, resetPasswordExpires: expires } });
            } else {
                user.resetPasswordToken = hashedToken;
                user.resetPasswordExpires = expires;
                memSave(user);
            }

            const frontendBase = process.env.FRONTEND_URL || process.env.FRONTEND_ORIGINS?.split(",")[0] || "http://localhost:5173";
            const resetUrl = `${frontendBase}/reset-password/${resetToken}`;

            // Email dispatch via Nodemailer if configured
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;
            if (process.env.NODE_ENV !== "test" && user.email && emailUser && emailPass) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        connectionTimeout: 5000,
                        socketTimeout: 10000,
                        auth: { user: emailUser, pass: emailPass }
                    });
                    await transporter.sendMail({
                        from: `"Sampoorn Kisan AI Security" <${emailUser}>`,
                        to: user.email,
                        subject: "Password Reset Request â€” Sampoorn Kisan AI ðŸŒ¾",
                        html: `
                          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f4f7f6; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #c8e6c9;">
                            <h2 style="color: #2e7d32; margin-bottom: 12px;">ðŸ”’ Password Reset Request</h2>
                            <p style="font-size: 15px; color: #333;">We received a request to reset your password for Sampoorn Kisan AI.</p>
                            <p style="font-size: 14px; color: #555;">Click the secure button below to set a new password. This link is single-use and will expire in 15 minutes.</p>
                            <div style="margin: 24px 0; text-align: center;">
                              <a href="${resetUrl}" style="background-color: #2e7d32; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">Reset My Password</a>
                            </div>
                            <p style="color: #777; font-size: 12px;">If you did not request this, you can safely ignore this email. Your account remains secure.</p>
                          </div>
                        `
                    });
                } catch (mailErr) {
                    if (isMongo) {
                        await User.updateOne({ _id: user._id, resetPasswordToken: hashedToken }, { $unset: { resetPasswordToken: '', resetPasswordExpires: '' } });
                    } else if (user.resetPasswordToken === hashedToken) {
                        delete user.resetPasswordToken;
                        delete user.resetPasswordExpires;
                        memSave(user);
                    }
                    console.error('Password reset email delivery failed.');
                    return res.status(503).json({ success: false, error: 'Password reset email delivery is unavailable. Please try again later.' });
                }
            }
        }

        // Always return generic success message to prevent account enumeration
        return res.json({
            success: true,
            code: "RESET_REQUESTED",
            message: "If an account matches that email address, a password reset link has been sent.",
            ...(process.env.NODE_ENV === "test" && resetToken ? { testResetToken: resetToken } : {})
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            error: "Password reset request failed",
            message: "Unable to process password reset right now. Please try again."
        });
    }
};

// â”€â”€ Reset Password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, password, confirmPassword } = req.body || {};

        if (
            !token ||
            typeof token !== "string" ||
            token.trim().length === 0 ||
            token.length > 128
        ) {
            return res.status(400).json({
                success: false,
                code: "INVALID_RESET_TOKEN",
                error: "Password reset link is invalid or has expired. Please request a new one.",
                message: "Password reset link is invalid or has expired. Please request a new one."
            });
        }

        if (
            (newPassword && typeof newPassword !== "string") ||
            (password && typeof password !== "string") ||
            (confirmPassword && typeof confirmPassword !== "string")
        ) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                error: "Invalid password input type",
                message: "Please enter a valid password."
            });
        }

        const effectivePass = (newPassword || password || "");
        const effectiveConfirm = (confirmPassword || "");

        if (!effectivePass) {
            return res.status(400).json({
                success: false,
                code: "INVALID_INPUT",
                error: "New password is required",
                message: "Please provide a new password."
            });
        }

        if (effectivePass.length < 8 || Buffer.byteLength(effectivePass) > 72) {
            return res.status(400).json({
                success: false,
                code: "WEAK_PASSWORD",
                error: "Password must be at least 8 characters and at most 72 UTF-8 bytes",
                message: "Password must be at least 8 characters and at most 72 UTF-8 bytes long."
            });
        }

        if (effectiveConfirm && effectivePass !== effectiveConfirm) {
            return res.status(400).json({
                success: false,
                code: "PASSWORD_MISMATCH",
                error: "Passwords do not match",
                message: "Passwords do not match."
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");
        let user = null;
        let isMongo = false;

        // 1. Search in MongoDB
        if (isDbOperational()) {
            try {
                user = await User.findOne({
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: { $gt: Date.now() }
                });
                if (user) isMongo = true;
            } catch (dbErr) {
                console.warn("âš ï¸ Mongo reset-password find failed:", dbErr.message);
            }
        }

        // 2. Search in In-Memory Store
        if (!user) {
            for (const [, u] of memUsers) {
                if (u && u.resetPasswordToken === hashedToken && u.resetPasswordExpires && u.resetPasswordExpires > Date.now()) {
                    user = u;
                    break;
                }
            }
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                code: "INVALID_RESET_TOKEN",
                error: "Password reset link is invalid or has expired.",
                message: "Password reset link is invalid or has expired. Please request a new one."
            });
        }

        // 3. Hash new password and invalidate reset token
        const hashedPassword = await bcrypt.hash(effectivePass, 10);
        if (isMongo) {
            const consumed = await User.findOneAndUpdate({ _id: user._id, resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } }, {
                $set: { password: hashedPassword, passwordChangedAt: new Date() },
                $inc: { sessionVersion: 1 },
                $unset: { resetPasswordToken: '', resetPasswordExpires: '' }
            }, { new: true });
            if (!consumed) return res.status(400).json({ success: false, code: 'INVALID_RESET_TOKEN', error: 'Password reset link is invalid or expired.' });
        } else {
            if (user.resetPasswordToken !== hashedToken || new Date(user.resetPasswordExpires).getTime() <= Date.now()) return res.status(400).json({ success: false, code: 'INVALID_RESET_TOKEN', error: 'Password reset link is invalid or expired.' });
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.passwordChangedAt = new Date();
            user.sessionVersion = (user.sessionVersion || 0) + 1;
            memSave(user);
        }

        // 4. Clear any active session cookie
        clearAuthCookie(res);

        return res.json({
            success: true,
            code: "RESET_SUCCESS",
            message: "Password has been successfully reset. You can now log in with your new password."
        });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            error: "Password reset failed",
            message: "Unable to reset password right now. Please try again."
        });
    }
};

// â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const logout = async (req, res) => {
    try {
        if (req.user) {
            if(isDbOperational()) await User.updateOne({_id:req.userId},{$inc:{sessionVersion:1}},{maxTimeMS:3000});
            else await updateUserById(req.userId, { sessionVersion: (req.user.sessionVersion || 0) + 1 });
        }
        clearAuthCookie(res);
        return res.json({
            success: true,
            code: "LOGOUT_SUCCESS",
            message: "Logged out successfully."
        });
    } catch (err) {
        return res.status(500).json({ error: "Logout failed" });
    }
};

const getProfile = async (req, res) => {
    try {
        if (req.user) {
            return res.json({ user: sanitizeUser(req.user) });
        }

        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        const user = await getUserById(decoded.id);
        if (!user) return res.status(404).json({ error: "User session expired. Please log in again." });
        if (user.passwordChangedAt && decoded.iat) {
            const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({ error: "Password was recently reset. Please log in again." });
            }
        }
        return res.json({ user: sanitizeUser(user) });
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// â”€â”€ Update Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const updateProfile = async (req, res) => {
    try {
        let effectiveUserId = req.userId;

        if (!effectiveUserId) {
            let token = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            }
            if (!token) {
                return res.status(401).json({ error: "Authentication token required. Please sign in." });
            }
            const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
            effectiveUserId = decoded.id;
            const userRecord = await getUserById(decoded.id);
            if (!userRecord) return res.status(404).json({ error: "User not found" });
            if (userRecord.passwordChangedAt && decoded.iat) {
                const changedTimestamp = Math.floor(new Date(userRecord.passwordChangedAt).getTime() / 1000);
                if (decoded.iat < changedTimestamp) {
                    return res.status(401).json({ error: "Password was recently reset. Please log in again." });
                }
            }
        }

        const { name, location, locationObj, cropType, farmSizeHectares, farmProfile, preferredLanguage, fcmToken } = req.body || {};

        if (name && (typeof name !== "string" || name.length > 100)) {
            return res.status(400).json({ error: "Name must be a string up to 100 characters." });
        }
        if (location && (typeof location !== "string" || location.length > 200)) {
            return res.status(400).json({ error: "Location must be a string up to 200 characters." });
        }
        if (cropType && (typeof cropType !== "string" || cropType.length > 100)) {
            return res.status(400).json({ error: "Crop type must be a string up to 100 characters." });
        }
        if (fcmToken !== undefined && fcmToken !== null && (typeof fcmToken !== "string" || fcmToken.length > 512)) {
            return res.status(400).json({ error: "fcmToken must be a valid string up to 512 characters." });
        }

        // Check in-memory store first
        const memUser = !isDbOperational() && memFindById(effectiveUserId);
        if (memUser) {
            if (name) memUser.name = name.trim();
            if (location) memUser.location = location.trim();
            if (locationObj) memUser.locationObj = locationObj;
            if (cropType) memUser.cropType = cropType.trim();
            if (farmSizeHectares) memUser.farmSizeHectares = farmSizeHectares;
            if (farmProfile) {
                memUser.farmProfile = farmProfile;
                conversationMemory.syncFarmProfileState(memUser.email || effectiveUserId, farmProfile);
            }
            if (preferredLanguage) memUser.preferredLanguage = preferredLanguage;
            if (fcmToken !== undefined) {
                memUser.fcmToken = fcmToken ? String(fcmToken).trim() : null;
            }
            memSave(memUser);
            return res.json({ message: "Profile updated successfully 🌱", user: sanitizeUser(memUser) });
        }

        try {
            const user = await User.findById(effectiveUserId);
            if (!user) return res.status(404).json({ error: "User not found" });
            if (name) user.name = name.trim();
            if (location) user.location = location.trim();
            if (locationObj) user.locationObj = locationObj;
            if (cropType) user.cropType = cropType.trim();
            if (farmSizeHectares) user.farmSizeHectares = farmSizeHectares;
            if (farmProfile) {
                user.farmProfile = farmProfile;
                conversationMemory.syncFarmProfileState(user.email || effectiveUserId, farmProfile);
            }
            if (preferredLanguage) user.preferredLanguage = preferredLanguage;
            if (fcmToken !== undefined) {
                user.fcmToken = fcmToken ? String(fcmToken).trim() : null;
            }
            await user.save();
            return res.json({ message: "Profile updated successfully 🌱", user: sanitizeUser(user) });
        } catch (dbErr) {
            if (!isMongoError(dbErr)) throw dbErr;
            return res.status(503).json({ error: "Database temporarily unavailable" });
        }

    } catch (err) {
        res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
};

const contactSupport = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        return res.json({ success: true, message: "Thank you for contacting Sampoorn Kisan AI support! Our team will respond shortly." });
    } catch (err) {
        return res.status(500).json({ error: "Failed to submit support request" });
    }
};

const getAllUsers = async () => {
    if (isDbOperational()) {
        try {
            const users = await User.find({}).select("-password -resetPasswordToken -resetPasswordExpires").lean();
            if (users && users.length > 0) return users;
        } catch (e) { void e; }
    }
    // Fallback: deduplicate from memUsers by id
    const seenIds = new Set();
    const users = [];
    for (const [, u] of memUsers) {
        if (u && u.id && !seenIds.has(u.id)) { seenIds.add(u.id); users.push(u); }
    }
    return users;
};

const updateUserById = async (id, updates) => {
    if (process.env.NODE_ENV === "production" && !isDbOperational()) throw Object.assign(new Error("Account storage is temporarily unavailable."), {status:503});
    if (isDbOperational()) {
        try {
            const u = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
            if (u) return u;
        } catch (e) { if(process.env.NODE_ENV === "production") throw Object.assign(new Error("Account storage is temporarily unavailable."), {status:503}); }
        if(process.env.NODE_ENV === "production") return null;
    }
    // Fallback: update in-memory map
    const existing = memFindById(id);
    if (existing) {
        Object.assign(existing, updates);
        memSave(existing);
        return existing;
    }
    return null;
};

const getUserById = async (id) => {
    if (process.env.NODE_ENV === "production" && !isDbOperational()) throw Object.assign(new Error("Account storage is temporarily unavailable."), { status: 503 });
    if (!id) return null;
    if (isDbOperational()) {
        try {
            const u = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpires");
            if (u) return u;
        } catch (e) {
            if(process.env.NODE_ENV === "production") throw Object.assign(new Error("Account storage is temporarily unavailable."), {status:503});
        }
        if(process.env.NODE_ENV === "production") return null;
    }
    return memFindById(id);
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,

    getProfile,
    updateProfile,
    contactSupport,



    getUserById,
    getAllUsers,
    updateUserById,
    memFindById


};
