import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    
    location: {
        type: String
    },
    avatar: {
        type: String
    },
    description: {
        type: String,
        default: " "
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    githubId: {
        type: String,
        default: null
    },
    badges : {
        type: [String],
        default: []
    },
    googleId: {
        type: String,
        default: null
    },
    xp: {
        type: Number,
        default: 0
    },
    lvl: {
        type: Number,
        default: 1
    },
    connections: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" } // friends array
  ],
    skillsSharedCount: {
    type: Number,
    default: 0
    },
    skillsLearnedCount: {
    type: Number,
    default: 0
    },

    skills: {
        type: [String],
        default: []
    },
    totalSwaps: {
        type: Number,
        default: 0
    },
    reviewsGiven: {
        type: Number,
        default: 0
    },
    reviewsReceived: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: function () {
            // password required ONLY if not using OAuth
            return !this.githubId && !this.googleId;
        }
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verifyToken: {
        type: String,
        default: null
    },
    verifyTokenExpires: {
        type: Date,
        default: null
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationTokenExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
    try {
        this.updatedAt = Date.now();

        if (!this.isModified("password") || !this.password) {
            return next();
        }

        const saltRounds = Number(process.env.SALT_ROUNDS || 10);
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false; // OAuth users won’t have one
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    const tokenLengthBytes = 32;
    const tokenPlain = crypto.randomBytes(tokenLengthBytes).toString("hex");
    const tokenHashed = crypto.createHash("sha256").update(tokenPlain).digest("hex");

    const oneDayMs = 24 * 60 * 60 * 1000;
    this.emailVerificationToken = tokenHashed;
    this.emailVerificationTokenExpires = new Date(Date.now() + oneDayMs);

    return tokenPlain;
};

const User = mongoose.model("User", userSchema);
export default User;
