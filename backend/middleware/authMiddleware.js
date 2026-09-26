const jwt = require("jsonwebtoken");
const { getUserById } = require("../controllers/authController");

const { JWT_SECRET } = require('../config/security');

/**
 * Authentication Middleware: Validates JWT token and attaches user object to req.user
 * Supports both Authorization Bearer header and HttpOnly token cookie.
 */
const requireAuth = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                code: "AUTH_REQUIRED",
                error: "Authentication required. Please sign in.",
                message: "Authentication required. Please sign in."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        req.userId = decoded.id;
        req.userToken = decoded;

        // Retrieve user from either Mongo or In-Memory store
        const user = await getUserById(decoded.id);

        if (user) {
            if (user.isActive === false) return res.status(403).json({ success: false, error: "Account is inactive." });
            // Check if password changed after token issuance
            if (user.passwordChangedAt && decoded.iat) {
                const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
                if (decoded.iat < changedTimestamp) {
                    return res.status(401).json({
                        success: false,
                        code: "PASSWORD_CHANGED",
                        error: "Password was recently reset. Please sign in again.",
                        message: "Password was recently reset. Please sign in again."
                    });
                }
            }
            if ((decoded.sv || 0) !== (user.sessionVersion || 0)) return res.status(401).json({ success: false, code: 'SESSION_REVOKED', error: 'Session revoked. Please sign in again.' });
            req.user = user;
            return next();
        }

        // If user cannot be found in database or memory store, session is invalid
        return res.status(401).json({
            success: false,
            code: "ACCOUNT_NOT_FOUND",
            error: "User account associated with this session no longer exists.",
            message: "User account associated with this session no longer exists."
        });

    } catch (err) {
        if (err.status === 503) return res.status(503).json({ success: false, error: 'Account storage is temporarily unavailable.' });
        return res.status(401).json({
            success: false,
            code: "TOKEN_EXPIRED_OR_INVALID",
            error: "Session expired or invalid. Please sign in again.",
            message: "Session expired or invalid. Please sign in again."
        });
    }
};

/**
 * Optional Authentication Middleware: If token exists, attaches req.user; otherwise continues
 */
const optionalAuth = async (req, res, next) => {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        const user = await getUserById(decoded.id);
        if (user && (decoded.sv || 0) === (user.sessionVersion || 0)) {
            req.userId = decoded.id;
            if (user.passwordChangedAt && decoded.iat) {
                const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
                if (decoded.iat < changedTimestamp) return next();
            }
            req.user = user;
        }
    } catch {
        // Ignore token errors for optional auth
    }
    next();
};

module.exports = { requireAuth, optionalAuth };
