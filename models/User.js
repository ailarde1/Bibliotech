const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    //add more for user
});

module.exports = mongoose.model('User', userSchema);