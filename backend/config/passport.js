// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ==================== GOOGLE STRATEGY ====================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth enabled');
  console.log('📌 GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
        proxy: true,
        authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL: 'https://oauth2.googleapis.com/token',
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔍 Google Profile:', profile.id, profile.emails?.[0]?.value);
          
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found from Google'), null);
          }
          
          let user = await User.findOne({ 
            $or: [
              { googleId: profile.id },
              { email: email }
            ]
          });

          if (user) {
            console.log('✅ Existing Google user found:', user.email);
            
            const updateData = {
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || user.avatar,
              lastLogin: new Date(),
              isEmailVerified: true,
              isActive: true
            };
            
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { $set: updateData },
              { new: true }
            );
            
            console.log('✅ Google user updated:', updatedUser.email);
            const token = generateToken(updatedUser);
            return done(null, { user: updatedUser, token });
          }

          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName || profile.name?.givenName || email.split('@')[0],
            email: email,
            role: 'user',
            avatar: profile.photos?.[0]?.value || '',
            isEmailVerified: true,
            isActive: true,
            lastLogin: new Date()
          });

          await newUser.save();
          console.log('✅ New Google user created:', newUser.email);
          const token = generateToken(newUser);
          return done(null, { user: newUser, token });
          
        } catch (error) {
          console.error('❌ Google Error:', error);
          console.error('Stack:', error.stack);
          return done(error, null);
        }
      }
    )
  );
}

// ==================== GITHUB STRATEGY - COMPLETELY FIXED ====================
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ GitHub OAuth enabled');
  console.log('📌 GITHUB_CALLBACK_URL:', process.env.GITHUB_CALLBACK_URL);
  
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        passReqToCallback: true,
        scope: ['user:email'],
        proxy: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔍 GitHub Profile received:', profile.id, profile.username);
          
          // Get email - try multiple sources
          let email = profile.emails?.[0]?.value;
          
          if (!email && accessToken) {
            try {
              const fetch = (await import('node-fetch')).default;
              const response = await fetch('https://api.github.com/user/emails', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              });
              const emails = await response.json();
              console.log('📧 GitHub emails:', emails);
              
              if (Array.isArray(emails)) {
                const primary = emails.find(e => e.primary === true);
                if (primary) email = primary.email;
                if (!email) {
                  const verified = emails.find(e => e.verified === true);
                  if (verified) email = verified.email;
                }
                if (!email && emails.length > 0) {
                  email = emails[0].email;
                }
              }
            } catch (err) {
              console.log('Could not fetch email:', err.message);
            }
          }
          
          // Fallback email
          if (!email) {
            email = `${profile.username}@github.com`;
            console.log('⚠️ Using fallback email:', email);
          }
          
          email = email.toLowerCase();
          console.log('📧 Final email:', email);
          
          // ✅ FIXED #1: Find by githubId - use findByIdAndUpdate
          let user = await User.findOne({ githubId: profile.id });
          
          if (user) {
            console.log('✅ Existing GitHub user found by ID:', user.email);
            
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { 
                $set: { 
                  lastLogin: new Date(),
                  isActive: true
                } 
              },
              { new: true }
            );
            
            console.log('✅ GitHub user updated:', updatedUser.email);
            const token = generateToken(updatedUser);
            return done(null, { user: updatedUser, token });
          }
          
          // ✅ FIXED #2: Find by email - use findByIdAndUpdate
          user = await User.findOne({ email: email });
          if (user) {
            console.log('✅ Existing user found by email:', email);
            
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { 
                $set: { 
                  githubId: profile.id,
                  lastLogin: new Date(),
                  isActive: true,
                  isEmailVerified: true
                } 
              },
              { new: true }
            );
            
            console.log('✅ GitHub user linked:', updatedUser.email);
            const token = generateToken(updatedUser);
            return done(null, { user: updatedUser, token });
          }
          
          // Create new user
          console.log('📝 Creating new GitHub user:', email);
          const newUser = new User({
            githubId: profile.id,
            name: profile.displayName || profile.username || 'GitHub User',
            email: email,
            role: 'user',
            avatar: profile.photos?.[0]?.value || '',
            isEmailVerified: !!profile.emails?.[0]?.value,
            isActive: true,
            lastLogin: new Date()
          });

          await newUser.save();
          console.log('✅ New GitHub user created:', newUser.email);
          
          const token = generateToken(newUser);
          return done(null, { user: newUser, token });
          
        } catch (error) {
          console.error('❌ GitHub Strategy Error:');
          console.error('   Name:', error.name);
          console.error('   Message:', error.message);
          console.error('   Code:', error.code);
          console.error('   Stack:', error.stack);
          
          // ✅ FIXED #3: Handle duplicate key error with findByIdAndUpdate
          if (error.code === 11000) {
            console.log('⚠️ Duplicate key, attempting recovery...');
            try {
              let email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
              email = email.toLowerCase();
              
              let existingUser = await User.findOne({ email: email });
              if (existingUser) {
                console.log('✅ Found user by email, updating githubId');
                
                const updatedUser = await User.findByIdAndUpdate(
                  existingUser._id,
                  { 
                    $set: { 
                      githubId: profile.id,
                      lastLogin: new Date(),
                      isActive: true,
                      isEmailVerified: true
                    } 
                  },
                  { new: true }
                );
                
                const token = generateToken(updatedUser);
                return done(null, { user: updatedUser, token });
              }
            } catch (recoveryError) {
              console.error('Recovery failed:', recoveryError);
            }
          }
          
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;