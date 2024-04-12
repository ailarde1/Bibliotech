const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: "" },
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
