import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./DB/db.js";
import User from "./models/user.js";
import Message from "./models/message.js";

import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import passport from "passport";
import session from "express-session";
import { Strategy as GitHubStrategy } from "passport-github2";
import SkillSwapPost from "./models/skillswapPost.js";
import AchivmentPost from "./models/achivementPost.js";
import ConnectionRequest from "./models/connectionreq.js";
import Connection from "./models/connect.js";
import SkillSwap from "./models/skillswap.js";
import SkillSwapRequest from "./models/skillswaprequest.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";
import Note from "./models/notes.js";

// ----------------- App / Server Bootstrap -----------------
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const fronendUrl = process.env.FRONTEND_URL || "*";
const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// DB connect (use your connectDB or fallback)
if (typeof connectDB === "function") {
  await connectDB();
} else if (!mongoose.connection.readyState) {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/skillswap");
}

// Middlewares
app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // loosen during dev; tighten in prod
    credentials: true,
  })
);
app.use(express.json());
app.set("trust proxy", 1);

// Sessions (for OAuth flows)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----------------- Auth Middleware -----------------
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.jwtPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ----------------- Passport (Google) -----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${backendUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value,
            password: "google_oauth_no_password",
            emailVerified: true,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      lvl: user.lvl,
      xp: user.xp,
      connections: Array.isArray(user.connections) ? user.connections.map(String) : [],
      skillsShared: user.skillsShared || [],
      skillsLearned: user.skillsLearned || [],
      totalSwaps: user.totalSwaps || 0,
      reviewsGiven: user.reviewsGiven || 0,
      reviewsReceived: user.reviewsReceived || 0,
      emailVerified: !!user.emailVerified,
      discription: user.discription || "",
      skills: user.skills || [],
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${fronendUrl}/auth-success?token=${token}`);
  }
);

// ----------------- Passport (GitHub) -----------------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${backendUrl}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            githubId: profile.id,
            emailVerified: true,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`${fronendUrl}/auth-success?token=${token}`);
  }
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ----------------- Auth Routes -----------------
// Register user
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    let user = await User.findOne({ email });

    // If email exists but not verified, resend token
    if (user && !user.emailVerified) {
      const token = crypto.randomBytes(32).toString("hex");
      user.verifyToken = token;
      user.verifyTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      const link = `${backendUrl}/api/auth/verify-email?token=${token}`;
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: '"SkillSwap" <no-reply@solotodo.com>',
          to: user.email,
          subject: "Verify Your Email",
          html: `<h3>Hello, ${user.name}</h3>
                 <p>Click below to verify your email:</p>
                 <a href="${link}">${link}</a>`,
        });
      } catch (_) {}

      return res
        .status(200)
        .json({ message: "Email exists but not verified. Verification email resent." });
    }

    // If user already exists and verified
    if (user && user.emailVerified) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new user
    const token = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      name,
      email,
      password,
      verifyToken: token,
      verifyTokenExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    const link = `${backendUrl}/api/auth/verify-email?token=${token}`;
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: '"SkillSwap" <no-reply@solotodo.com>',
        to: user.email,
        subject: "Verify Your Email",
        html: `<h3>Hello, ${name}</h3>
               <p>Click below to verify your email:</p>
               <a href="${link}">${link}</a>`,
      });
    } catch (_) {}

    return res.status(201).json({ message: "Registered! Check your email to verify." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", details: error.message });
  }
});

// Verify Email
app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/email-verification?status=error`);

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/email-verification?status=error`);
    }

    user.emailVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;
    await user.save();

    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/email-verification?status=success`);
  } catch (err) {
    console.error("Email verification failed:", err);
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/email-verification?status=error`);
  }
});




app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }

    // Payload for JWT
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      lvl: user.lvl,
      xp: user.xp,
      connections: Array.isArray(user.connections) ? user.connections.map(String) : [],
      skillsShared: user.skillsShared || [],
      skillsLearned: user.skillsLearned || [],
      totalSwaps: user.totalSwaps || 0,
      reviewsGiven: user.reviewsGiven || 0,
      reviewsReceived: user.reviewsReceived || 0,
      emailVerified: !!user.emailVerified,
      description: user.description || "", // fixed typo
      skills: user.skills || [],
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Profile -----------------
app.put("/api/user/profile", authenticate, async (req, res) => {
  try {
    const { name, location, avatar, bio, skills } = req.body || {};
    const updates = {};
    if (typeof name === "string" && name.trim().length) updates.name = name.trim();
    if (typeof bio === "string") updates.discription = bio;
    if (typeof location === "string") updates.location = location;
    if (typeof avatar === "string") updates.avatar = avatar;

    if (Array.isArray(skills)) {
      updates.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      updates.skills = skills.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid fields to update" });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const payload = {
      id: user._id,
      location: user.location,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      lvl: user.lvl,
      xp: user.xp,
      connections: Array.isArray(user.connections) ? user.connections.map(String) : [],
      skillsShared: user.skillsShared || [],
      skillsLearned: user.skillsLearned || [],
      totalSwaps: user.totalSwaps || 0,
      reviewsGiven: user.reviewsGiven || 0,
      reviewsReceived: user.reviewsReceived || 0,
      emailVerified: !!user.emailVerified,
      discription: user.discription || "",
      skills: user.skills || [],
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ message: "Profile updated", token });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Name already in use" });
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

// ----------------- Posts -----------------
app.post("/api/post/skillswap", authenticate, async (req, res) => {
  const userId = req.userId;
  const { OfferedSkill, WantedSkill, description } = req.body;
  const newSkillPost = new SkillSwapPost({ userId, OfferedSkill, WantedSkill, description });
  await newSkillPost.save();
  res.status(201).json({ message: "SkillSwap post created" });
});

app.get("/api/post/skillswap", authenticate, async (req, res) => {
  try {
    const posts = await SkillSwapPost.find()
      .populate("userId", "_id name email avatar description skills")
      .sort({ createdAt: -1 });

    // ✅ Option 1: Keep posts even if user is missing (user = null)
    const formattedPosts = posts.map((post) => {
      const user = post.userId
        ? {
            id: post.userId._id,
            name: post.userId.name,
            email: post.userId.email,
            status: post.status,
            avatar: post.userId.avatar,
            description: post.userId.description,
            skills: post.userId.skills,
          }
        : null; // if userId is missing or deleted
        
        return {
          ...post.toObject(),
          user,
        };
      });
      
    return res.status(200).json(formattedPosts);
  } catch (err) {
    console.error("Error fetching SkillSwap posts:", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
});


app.post("/api/post/achievement", authenticate, async (req, res) => {
  const userId = req.userId;
  const { title, description, tags } = req.body;
  const newAchievement = new AchivmentPost({ userId, title, description, tags });
  await newAchievement.save();
  res.status(201).json({ message: "Achievement created" });
});

app.get("/api/post/my-posts", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const skillPosts = await SkillSwapPost.find({ userId }).sort({ createdAt: -1 });
    const achievements = await AchivmentPost.find({ userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({ skillPosts, achievements });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch your posts" });
  }
});

app.get("/api/post/achievement", authenticate, async (req, res) => {
  try {
    const achievements = await AchivmentPost.find()
      .populate("userId", "_id name email avatar description skills")
      .sort({ createdAt: -1 });

    // ✅ Option 1: Keep posts even if user is missing (user = null)
    const formattedAchievements = achievements.map((ach) => {
      const user = ach.userId
        ? {
            id: ach.userId._id,
            name: ach.userId.name,
            email: ach.userId.email,
            avatar: ach.userId.avatar,
            description: ach.userId.description,
            skills: ach.userId.skills,
          }
        : null; // if userId is missing or deleted

      return {
        ...ach.toObject(),
        user,
      };
    });
    const finalResult = formattedAchievements.splice(0, 20);
    return res.status(200).json(finalResult);
  } catch (err) {
    console.error("Error fetching Achievements:", err);
    return res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

app.delete("/api/post/:postId", authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const skillPost = await SkillSwapPost.findOneAndDelete({ _id: postId, userId });
    if (skillPost) {
      return res.json({ message: "SkillSwap post deleted" });
    }

    const achievement = await AchivmentPost.findOneAndDelete({ _id: postId, userId });
    if (achievement) {
      return res.json({ message: "Achievement deleted" });
    }

    return res.status(404).json({ message: "Post not found or not authorized" });
  }
  catch (err) {
    return res.status(500).json({ message: "Failed to delete post" });
  }
});

// ----------------- Connections -----------------
app.post("/api/connections/request/:toUserId", authenticate, async (req, res) => {
  // try {
  console.log("working");
  
    const { toUserId } = req.params;
    const fromUserId = req.userId;
    
    if (fromUserId === toUserId) return res.status(400).json({ message: "You cannot send a request to yourself" });

    const existing = await ConnectionRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      status: "pending",
    });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    const fromUser = await User.findById(fromUserId);
    if (fromUser.connections.includes(toUserId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    const request = await ConnectionRequest.create({
      fromUser: fromUserId,
      toUser: toUserId,
      status: "pending",
    });

    return res.status(201).json({ message: "Request sent", request });
  // } catch (err) {
  //   return res.status(500).json({ message: "Failed to send request" });
  // }
});

app.get("/api/connections/requests", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await ConnectionRequest.find({
      toUser: userId,
      status: "pending",
    }).populate("fromUser", "name email avatar");

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
});

app.post("/api/connections/respond/:requestId", authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    const request = await ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (String(request.toUser) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

      await User.findByIdAndUpdate(request.fromUser, { $addToSet: { connections: request.toUser } });
      await User.findByIdAndUpdate(request.toUser, { $addToSet: { connections: request.fromUser } });

      return res.json({ message: "Connection accepted" });
    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();
      return res.json({ message: "Connection rejected" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Failed to respond to request" });
  }
});

app.get("/api/connections", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const connections = await Connection.find({ users: userId }).populate("users", "name email avatar");
    return res.json(connections);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch connections" });
  }
});

// ----------------- Friends (for chat list) -----------------
app.get("/api/friends", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("connections", "_id name email avatar");

    if (!user) return res.status(404).json({ message: "User not found" });

    // fallback to empty array if populate fails
    const connections = Array.isArray(user.connections) ? user.connections : [];

    // convert Mongoose docs to plain objects
    const plainConnections = connections.map((c) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      avatar: c.avatar,
    }));

    return res.json({ data: plainConnections });
  } catch (err) {
    console.error("Failed to fetch friends:", err);
    return res.status(500).json({ message: "Failed to fetch friends", data: [] });
  }
});




// ----------------- Chat: History APIs -----------------
// Get DM history with a specific user
app.get("/api/messages/:peerId", authenticate, async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

    // Optional pagination
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = {
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    };
    if (before) query.createdAt = { $lt: before };

    const docs = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(docs.reverse()); // oldest->newest
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Mark all messages from peer as read
app.post("/api/messages/:peerId/read", authenticate, async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;
    const result = await Message.updateMany(
      { from: peer, to: me, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return res.json({ updated: result.modifiedCount });
  } catch (err) {
    return res.status(500).json({ message: "Failed to mark read" });
  }
});

// ----------------- Socket.io (JWT-guarded) -----------------
const io = new Server(server, {
  cors: {
    origin: fronendUrl === "*" ? "*" : [fronendUrl],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket Auth (expects token via `auth.token` or `Authorization`)
io.use((socket, next) => {
  try {
    const header = socket.handshake.auth?.token
      || socket.handshake.headers?.authorization
      || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
    if (!token) return next(new Error("NO_AUTH_TOKEN"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error("INVALID_TOKEN"));
  }
});

const onlineUsers = new Map(); // userId -> socket.id(s) set

io.on("connection", (socket) => {
  const userId = String(socket.userId);
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Join personal room for DMs
  socket.join(userId);

  // Send presence to client (optional)
  io.to(userId).emit("presence:self", { userId, online: true });

  // Receive and forward a DM
  socket.on("chat:send", async ({ to, content }, ack) => {
    try {
      if (!to || !content || !String(content).trim()) {
        if (ack) ack({ ok: false, error: "INVALID_PAYLOAD" });
        return;
      }

      // Persist
      const msg = await Message.create({
        from: userId,
        to,
        content: String(content),
        deliveredAt: new Date(),
      });

      const payload = {
        _id: msg._id,
        from: msg.from,
        to: msg.to,
        content: msg.content,
        createdAt: msg.createdAt,
        deliveredAt: msg.deliveredAt,
        readAt: msg.readAt,
      };

      // Emit to sender (mirror) and receiver
      io.to(userId).emit("chat:receive", payload);
      io.to(to).emit("chat:receive", payload);

      if (ack) ack({ ok: true, message: payload });
    } catch (err) {
      if (ack) ack({ ok: false, error: "SERVER_ERROR" });
    }
  });

  // Typing indicators (optional)
  socket.on("chat:typing", ({ to, typing }) => {
    io.to(to).emit("chat:typing", { from: userId, typing: !!typing });
  });

  socket.on("disconnect", () => {
    const set = onlineUsers.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        onlineUsers.delete(userId);
        io.to(userId).emit("presence:self", { userId, online: false });
      }
    }
  });
});



// ----------------- Skill Swap Requests -----------------

app.post("/api/request/skilswap/:Id", authenticate, async (req, res) => {
  try {
    const { toUser, skillOffered, skillWanted, message } = req.body;
    const fromUser = req.userId; // ✅ from authenticate
    let toPost = req.params;
    // validate properly
    toPost = toPost.Id;
    const post = await SkillSwapPost.findById(toPost);
    if (!post) {
      return res.status(404).json({ message: "Target SkillSwap post not found" });
    }
    if (!toUser?.trim?.() || !skillOffered?.trim?.() || !skillWanted?.trim?.()) {
      console.log("Missing required fields:", { toUser, skillOffered, skillWanted });
      return res.status(400).json({ message: "Missing required fields" });
      
    }
    console.log(fromUser === toUser);
    if (fromUser === toUser) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }
    
    const newRequest = new SkillSwapRequest({
      fromUser,
      toUser,
      toPost,
      message,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      status: "pending",   // default anyway, but explicit
    });
    post.status = "ongoing"; // mark post as pending
    await post.save();
    await newRequest.save();

    res.status(201).json({
      message: "Skill swap request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.post("/api/request/skilswap/respond/:id", authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.userId;
    const request = await SkillSwapRequest
      .findById(requestId)
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("toPost", "status");
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.toUser._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already responded to" });
    }
    if (action === "accept") {
      
      request.status = "accepted";
      await request.save();
      const newSwap = new SkillSwap({
        userA: request.fromUser._id,
        userB: request.toUser._id,
        skillOffered: request.skillOffered,
        skillWanted: request.skillWanted,
        status: "active",
        startedAt: new Date(),
      });
      request.toPost.status = "closed"; // mark post as inactive
      await request.toPost.save();
      await newSwap.save();
      return res.json({ message: "Request accepted", swap: newSwap });
    }
    else if (action === "reject") {
      request.status = "rejected";
      request.toPost.status = "open"; // reopen post
      await request.toPost.save();
      await request.save();
      return res.json({ message: "Request rejected" });
    }
    else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/api/request/skilswap", authenticate, async (req, res) => {
  
  try {
    const userId = req.userId;

    const requests = await SkillSwapRequest.find({
      status: "pending",
      $or: [{ fromUser: userId }, { toUser: userId }],
    }).populate("fromUser", "name email avatar lvl totalSwaps").populate("toUser", "name email avatar lvl totalSwaps")
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/api/skillswaps/active", authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const swaps = await SkillSwap.find({
      status: "active",
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "name email")
      .populate("userB", "name email");

    res.json(swaps);
  } catch (err) {
    console.error("Error fetching active swaps:", err);
    res.status(500).json({ message: "Error fetching active swaps" });
  }
});

app.post("/api/skillswap/complete/:id", authenticate, async (req, res) => {
  try {
    const { links } = req.body;
    const swapId = req.params.id;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const swap = await SkillSwap.findById(swapId);
    if (!swap) return res.status(404).json({ message: "Skill swap not found" });

    // Only participants can mark as completed
    if (swap.userA.toString() !== userId && swap.userB.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // --- SAFE COMPLETION LOGIC ---
    if (swap.userA.toString() === userId) {
      if (swap.userACompleted) {
        return res.status(400).json({ message: "You already completed this swap" });
      }
      swap.userACompleted = true;
      if (links) swap.UserALinks = Array.isArray(links) ? links : [links];
    }

    if (swap.userB.toString() === userId) {
      if (swap.userBCompleted) {
        return res.status(400).json({ message: "You already completed this swap" });
      }
      swap.userBCompleted = true;
      if (links) swap.UserBLinks = Array.isArray(links) ? links : [links];
    }

    // If both are done → mark swap as completed
    if (swap.userACompleted && swap.userBCompleted) {
      swap.status = "completed";

      // Update stats
      await User.findByIdAndUpdate(swap.userA, {
        $inc: { skillsSharedCount: 1, totalSwaps: 1, xp: 500 },
      });
      await User.findByIdAndUpdate(swap.userB, {
        $inc: { skillsLearnedCount: 1, totalSwaps: 1, xp: 500 },
      });

      // Check XP/level for both users
      const user1 = await User.findById(swap.userA);
      const user2 = await User.findById(swap.userB);

      if (user1 && user1.xp >= getXpForLevel(user1.lvl)) {
        user1.lvl += 1;
        user1.xp = user1.xp - getXpForLevel(user1.lvl - 1);
        await user1.save();
      }

      if (user2 && user2.xp >= getXpForLevel(user2.lvl)) {
        user2.lvl += 1;
        user2.xp = user2.xp - getXpForLevel(user2.lvl - 1);
        await user2.save();
      }
    }

    await swap.save();

    // Refresh JWT payload for current user
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      lvl: user.lvl,
      xp: user.xp,
      connections: Array.isArray(user.connections) ? user.connections.map(String) : [],
      skillsShared: user.skillsShared || [],
      skillsLearned: user.skillsLearned || [],
      totalSwaps: user.totalSwaps || 0,
      reviewsGiven: user.reviewsGiven || 0,
      reviewsReceived: user.reviewsReceived || 0,
      emailVerified: !!user.emailVerified,
      description: user.description || "",
      skills: user.skills || [],
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Skill swap updated", swap, token });
  } catch (err) {
    console.error("Error completing skill swap:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.get("/api/skillswaps/history", authenticate, async (req, res) => {
  try { 
    const userId = req.userId;
    const swaps = await SkillSwap.find({
      status: "completed",
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "name email")
      .populate("userB", "name email")
      .sort({ completedAt: -1 });    
      
      res.json(swaps.slice(0, 5)); //Last 5 completed swaps
  } catch (err) {
    console.error("Error fetching swap history:", err);
    res.status(500).json({ message: "Error fetching swap history" });
  }
}
);

app.get("/api/skillswaps/history/:Id", authenticate, async (req, res) => {
  try { 
    const userId = req.params.Id;
    console.log(userId);
    
    const swaps = await SkillSwap.find({
      status: "completed",
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "name email")
      .populate("userB", "name email")
      .sort({ completedAt: -1 });    
      
      res.json(swaps.slice(0, 5)); //Last 5 completed swaps
  } catch (err) {
    console.error("Error fetching swap history:", err);
    res.status(500).json({ message: "Error fetching swap history" });
  }
}
);


// ----------------- Notes (for future use) -----------------

app.get("/api/notes", authenticate, async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(notes);
});

app.post("/api/notes", authenticate, async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  const newNote = new Note({ user: req.userId, title: title.trim() });
  await newNote.save();
  res.status(201).json(newNote);
}
);

app.delete("/api/notes/:id", authenticate, async (req, res) => {
  const noteId = req.params.id;
  const note = await Note.findOneAndDelete({ _id: noteId, user: req.userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  res.json({ message: "Note deleted" });
});


// ----------------- Badges (for future use) -----------------
app.get("/api/badges", authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  

  if(user.connections.length > 0) user.badges.push("First Connection");
  if(user.connections.length > 20) user.badges.push("Extrovert");
  if (user.totalSwaps > 0) user.badges.push("First Swap");
  if (user.totalSwaps >= 10) user.badges.push("Ten Swap");
  
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.badges || []);
});


// ----------------- Misc User APIs -----------------
app.get("/api/get/users", authenticate, async (_req, res) => {
  const getAllUsers = await User.find();
  res.json(getAllUsers);
});

app.get("/api/user/:userId", authenticate, async (req, res) => {
  const id = req.params.userId;
  const user = await User.findById(id);
  res.json(user);
});

app.get("/api/user/lvl/:id", authenticate, async (req, res) => {
  const id = req.userId;  
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ lvl: user.lvl, xp: user.xp });
});

app.get("/api/my-connection/:Id", authenticate, async (req, res) => {
  try {
    const id = req.userId; // or req.params.Id for other users
    const user = await User.findById(id).populate("connections", "_id name email avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    const connections = Array.isArray(user.connections) ? user.connections : [];
    const plainConnections = connections.map((c) => ({
      _id: c._id
    }));
    console.log(plainConnections);
    
    return res.json({ data: plainConnections });
  } catch (err) {
    console.error("Failed to fetch connections:", err);
    return res.status(500).json({ message: "Failed to fetch connections", data: [] });
  }
});


function getXpForLevel(level) {
  if (level < 1) return 0;
  return 500 + (level - 1) * 100;
}


// ----------------- Start -----------------
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
