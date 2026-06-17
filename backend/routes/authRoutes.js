// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const {
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP
} = require('../controllers/passwordResetController');

console.log('✅ Auth routes loaded');

// ==================== PUBLIC ROUTES ====================

// Regular authentication
router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

// ==================== GOOGLE OAUTH ROUTES ====================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth enabled');
  console.log('📌 GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  
  router.get('/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email', 'openid'],
      session: false,
      accessType: 'offline',
      prompt: 'select_account'
    })
  );

  // ✅ FIXED: Clean query params BEFORE passport processes them
  router.get('/google/callback',
    (req, res, next) => {
      console.log('📡 Google callback received');
      console.log('📝 Full URL:', req.originalUrl);
      console.log('📝 All query params:', req.query);
      
      // Check for error in query
      if (req.query.error) {
        console.error('❌ Google OAuth error:', req.query.error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_${req.query.error}`);
      }
      
      // Check for code
      if (!req.query.code) {
        console.error('❌ No authorization code received');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_authorization_code`);
      }
      
      // ✅ FIXED: Extract only the code and rebuild query
      const code = req.query.code;
      
      // ✅ FIXED: Override req.query to ONLY contain the code
      // This prevents passport from seeing extra params
      req.query = { code: code };
      
      console.log('✅ Code extracted and query cleaned:', code.substring(0, 10) + '...');
      console.log('📝 Cleaned query:', req.query);
      
      // ✅ FIXED: Also update req.url to remove extra params
      req.url = req.path + '?code=' + encodeURIComponent(code);
      
      console.log('📝 Cleaned URL:', req.url);
      
      next();
    },
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    (req, res) => {
      try {
        console.log('✅ Google OAuth callback success');
        
        if (!req.user) {
          console.error('❌ No user object in request');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_data`);
        }
        
        const { user, token } = req.user;
        console.log('✅ Google OAuth success for:', user.email);
        console.log('🔑 Token generated:', !!token);
        
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar || ''
        };
        
        const encodedUser = encodeURIComponent(JSON.stringify(userData));
        const redirectUrl = `${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&user=${encodedUser}`;
        
        console.log('🔄 Redirecting to:', redirectUrl.substring(0, 150) + '...');
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Google callback error:', error);
        console.error('Stack:', error.stack);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }
    }
  );
}

// ==================== GITHUB OAUTH ROUTES ====================
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ GitHub OAuth enabled');
  console.log('📌 GITHUB_CALLBACK_URL:', process.env.GITHUB_CALLBACK_URL);
  
  router.get('/github',
    passport.authenticate('github', { 
      scope: ['user:email'],
      session: false 
    })
  );

  router.get('/github/callback',
    (req, res, next) => {
      console.log('📡 GitHub callback received');
      console.log('📝 Query params:', req.query);
      
      if (req.query.error) {
        console.error('❌ GitHub OAuth error:', req.query.error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_${req.query.error}`);
      }
      
      if (!req.query.code) {
        console.error('❌ No authorization code received');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_github_code`);
      }
      
      next();
    },
    passport.authenticate('github', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`
    }),
    (req, res) => {
      try {
        console.log('✅ GitHub OAuth callback success');
        
        if (!req.user) {
          console.error('❌ No user object in request');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user_data`);
        }
        
        const { user, token } = req.user;
        console.log('✅ GitHub OAuth success for:', user.email);
        console.log('🔑 Token generated:', !!token);
        
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar || ''
        };
        
        const encodedUser = encodeURIComponent(JSON.stringify(userData));
        const redirectUrl = `${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&user=${encodedUser}`;
        
        console.log('🔄 Redirecting to:', redirectUrl.substring(0, 150) + '...');
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ GitHub callback error:', error);
        console.error('Stack:', error.stack);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }
    }
  );
}

// ==================== PRIVATE ROUTES ====================
router.get('/me', auth, getCurrentUser);
router.put('/me', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;