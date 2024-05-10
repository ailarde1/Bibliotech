const mongoose = require("mongoose");

const bookClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, // Reference to the current book
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of members
  startDate: { type: Date, default: Date.now }, // Start date of current book
  endDate: { type: Date }, // End date of current book
  messageBoard: [{
    message: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date, default: Date.now }
  }], // Messages posted in the book club
});

const BookClub = mongoose.model("BookClub", bookClubSchema);

module.exports = BookClub;