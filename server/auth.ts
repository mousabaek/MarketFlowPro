import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as AppleStrategy } from "passport-apple";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if stored password has the expected format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid password format in database');
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true,
    tableName: 'user_sessions' 
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'wolf-auto-marketer-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Configuring Google OAuth strategy');
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log('Google authentication callback received');
            console.log('Profile ID:', profile.id);
            console.log('Profile email:', profile.emails?.[0]?.value);
            
            // Check if user exists by googleId
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              console.log('No user found with this Google ID, checking email...');
              // Check if user exists by email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await storage.getUserByEmail(email);
              }
              
              if (user) {
                console.log('User found with matching email, linking Google account');
                // Link Google account to existing user
                user = await storage.updateUser(user.id, { 
                  googleId: profile.id,
                  provider: user.provider || "google"
                });
              } else {
                console.log('Creating new user from Google profile');
                // Create new user
                const username = profile.displayName.replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
                user = await storage.createUser({
                  username,
                  email: profile.emails?.[0]?.value || `${username}@example.com`,
                  firstName: profile.name?.givenName || "",
                  lastName: profile.name?.familyName || "",
                  avatar: profile.photos?.[0]?.value || "",
                  googleId: profile.id,
                  provider: "google"
                });
                console.log('Created new user:', username);
              }
            } else {
              console.log('Existing user found with Google ID');
            }
            return done(null, user);
          } catch (error) {
            console.error('Error in Google authentication:', error);
            return done(error);
          }
        }
      )
    );
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    console.log('Configuring GitHub OAuth strategy');
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: "/api/auth/github/callback",
          scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log('GitHub authentication callback received');
            console.log('Profile ID:', profile.id);
            console.log('Profile username:', profile.username);
            console.log('Profile email:', profile.emails?.[0]?.value);
            
            // Check if user exists by githubId
            let user = await storage.getUserByGithubId(profile.id);
            
            if (!user) {
              console.log('No user found with this GitHub ID, checking email...');
              // Check if user exists by email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await storage.getUserByEmail(email);
              }
              
              if (user) {
                console.log('User found with matching email, linking GitHub account');
                // Link GitHub account to existing user
                user = await storage.updateUser(user.id, { 
                  githubId: profile.id,
                  provider: user.provider || "github"
                });
              } else {
                console.log('Creating new user from GitHub profile');
                // Create new user
                const username = profile.username || "github" + Math.floor(Math.random() * 1000);
                user = await storage.createUser({
                  username,
                  email: profile.emails?.[0]?.value || `${username}@example.com`,
                  firstName: profile.displayName?.split(" ")[0] || "",
                  lastName: profile.displayName?.split(" ").slice(1).join(" ") || "",
                  avatar: profile.photos?.[0]?.value || "",
                  githubId: profile.id,
                  provider: "github"
                });
                console.log('Created new user:', username);
              }
            } else {
              console.log('Existing user found with GitHub ID');
            }
            return done(null, user);
          } catch (error) {
            console.error('Error in GitHub authentication:', error);
            return done(error);
          }
        }
      )
    );
  }
  
  // Apple OAuth Strategy (if credentials are available)
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY_LOCATION) {
    console.log('Configuring Apple OAuth strategy');
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          callbackURL: "/api/auth/apple/callback",
          keyID: process.env.APPLE_KEY_ID,
          privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            console.log('Apple authentication callback received');
            console.log('Profile ID:', profile.id);
            console.log('Profile email:', profile.emails?.[0]?.value);
            
            // Check if user exists by appleId
            let user = await storage.getUserByAppleId(profile.id);
            
            if (!user) {
              console.log('No user found with this Apple ID, checking email...');
              // Check if user exists by email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await storage.getUserByEmail(email);
              }
              
              if (user) {
                console.log('User found with matching email, linking Apple account');
                // Link Apple account to existing user
                user = await storage.updateUser(user.id, { 
                  appleId: profile.id,
                  provider: user.provider || "apple"
                });
              } else {
                console.log('Creating new user from Apple profile');
                // Create new user with data from Apple
                const firstName = profile.name?.firstName || "";
                const lastName = profile.name?.lastName || "";
                const username = "apple" + Math.floor(Math.random() * 10000);
                
                user = await storage.createUser({
                  username,
                  email: profile.emails?.[0]?.value || `${username}@example.com`,
                  firstName,
                  lastName,
                  appleId: profile.id,
                  provider: "apple"
                });
                console.log('Created new user:', username);
              }
            } else {
              console.log('Existing user found with Apple ID');
            }
            return done(null, user);
          } catch (error) {
            console.error('Error in Apple authentication:', error);
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed - Invalid username or password");
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return next(loginErr);
        }
        console.log("Authentication successful for user:", user.username);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Admin routes - protected by admin role check
  app.use('/api/admin', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  });

  // Social login routes
  // Google
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // GitHub
  app.get(
    "/api/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );

  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Apple
  app.get(
    "/api/auth/apple",
    passport.authenticate("apple")
  );

  app.post(
    "/api/auth/apple/callback",
    passport.authenticate("apple", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );
}