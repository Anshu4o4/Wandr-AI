import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      // Not required if using OAuth
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1582200201/avatar.png', // placeholder
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    savedTrips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
      },
    ],
    savedItineraries: [
      {
        type: Object, // Stores the full AI JSON object
      }
    ],
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only for email auth)
userSchema.pre('save', async function (next) {
  // Skip if using OAuth
  if (this.authProvider === 'google') return next();
  
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Indexes for performance optimization
userSchema.index({ role: 1 }); // For admin filtering queries

const User = mongoose.model('User', userSchema);
export default User;
