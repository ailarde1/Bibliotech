const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: "https://awsbucketbibliotecha.s3.us-east-2.amazonaws.com/NoUserImage.png" }, //Sets default image if none is given
  darkMode: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user friends
  requestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user friends requests sent
  requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user friend request received
});

// Hash password before saving the user document
userSchema.pre("save", function (next) {
  //Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next();

  // hash the password
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      //set password as hashed one
      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", userSchema);
