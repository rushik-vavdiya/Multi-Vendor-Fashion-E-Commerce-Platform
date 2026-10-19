import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthDate: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    profilePicture: {
      type: String,
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Never send the password hash or the Cloudinary public id to a client. Doing
// it once here means every controller can return a user document as-is.
userSchema.set("toJSON", {
  transform: (_document, returned) => {
    delete returned.password;
    delete returned.profilePicturePublicId;
    return returned;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
