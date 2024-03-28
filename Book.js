const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://maxxgarris33:baCd578D7LCVAV16@cluster0.rlrwlhn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));
  
  const bookSchema = new mongoose.Schema({
    title: String,
    authors: [String],
    publishedDate: String,
    thumbnail: String,
    description: String,
    pageCount: Number,
    height: String,
    length: String,
    width: String,
    isbn: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;