import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken, createPasswordResetToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';
import { OAuth2Client } from 'google-auth-library';

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('logged_in', 'true', {
    expires: cookieOptions.expires,
    httpOnly: false,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: '/',
  });

  user.password = undefined;
  user.refreshToken = undefined;

  // We should actually save refreshToken to DB if we want token rotation/revocation, but for simplicity here we just use cookie verification.

  res.status(statusCode).json({
    status: 'success',
    data: { 
      user,
      accessToken
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    const user = await User.create({ name, email, password });
    logger.info('New user registered', { email: user.email, userId: user._id });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('logged_in', { path: '/' });
  res.status(200).json({ status: 'success' });
};

export const refreshToken = async (req, res, next) => {
  try {
    const rfToken = req.cookies.refreshToken;
    if (!rfToken) {
      return res.status(401).json({ status: 'error', message: 'Not logged in' });
    }

    const decoded = jwt.verify(rfToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    const accessToken = signAccessToken(user._id);
    res.status(200).json({ 
      status: 'success', 
      data: { accessToken } 
    });
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({ status: 'success', data: { user: req.user } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    if (req.body.password) {
      return res.status(400).json({ status: 'error', message: 'Cannot update password here.' });
    }
    const filteredBody = { name: req.body.name, avatar: req.body.avatar };
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
    }

    user.password = req.body.newPassword;
    await user.save(); // runs validation and pre('save') hook
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(error.message, { stack: error.stack, userId: req.user?._id, route: req.originalUrl });
    next(error);
  }
};

// Simplified versions of reset pass for now
export const forgotPassword = async (req, res, next) => {
  res.status(501).json({status: 'error', message: 'Not implemented'});
}
export const resetPassword = async (req, res, next) => {
  res.status(501).json({status: 'error', message: 'Not implemented'});
}

// Google OAuth Handler
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, access_token } = req.body;
    const token = credential || access_token;
    
    if (!token) {
      return res.status(400).json({ status: 'error', message: 'No credential provided' });
    }

    // Verify Google token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let payload;
    
    try {
      // Try verifying as ID token first (for implicit flow with credential)
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (idTokenError) {
      // If ID token verification fails, try Google userinfo endpoint (for access tokens)
      try {
        const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Google userinfo request failed: ${response.status} ${errorBody}`);
        }
        payload = await response.json();
      } catch (tokeninfoError) {
        logger.error('Token verification failed', {
          error: tokeninfoError.message,
          route: req.originalUrl,
        });
        return res.status(401).json({ status: 'error', message: 'Invalid Google token' });
      }
    }

    const { sub: googleId, email, name, picture } = payload;
    
    if (!email || !googleId) {
      return res.status(401).json({ status: 'error', message: 'Could not extract user info from token' });
    }

    // Check if user exists with this email or googleId
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (user) {
      // Existing user - login
      if (!user.googleId) {
        // Link Google account to existing email user
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
      logger.info('User logged in via Google', { email, userId: user._id });
    } else {
      // New user - create account
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture,
        authProvider: 'google',
        isVerified: true, // Google users are pre-verified
      });
      logger.info('New user registered via Google', { email, userId: user._id });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(error.message, { stack: error.stack, route: req.originalUrl });
    res.status(401).json({ status: 'error', message: 'Google authentication failed' });
  }
};
