require("dotenv").config(); //needed for using .env
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const axios = require("axios");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const Book = require("./models/Book"); // Import Book model
const User = require("./models/User"); // Import the User model
const BookClub = require("./models/Bookclub"); //Import the Bookclub Model

const bcrypt = require("bcrypt");
const saltRounds = 10;
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const { Upload } = require("@aws-sdk/lib-storage");

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { Readable } = require("stream");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log("upload request sent");
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const fileStream = Readable.from(req.file.buffer);
  const fileKey = req.file.originalname;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: fileStream,
  };

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress); // logs upload progress
    });

    await parallelUploads3.done();

    // Constructs URL of the uploaded file
    const uploadedFileUrl = `https://${uploadParams.Bucket}.s3.${
      process.env.AWS_REGION
    }.amazonaws.com/${encodeURIComponent(uploadParams.Key)}`;

    console.log("File uploaded successfully:", uploadedFileUrl);
    res.status(200).json({ message: "File uploaded", url: uploadedFileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload file");
  }
});

//Search endpoint for Google Api.
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    const googleBooksApiUrl = process.env.GOOGLE_BOOKS_API_URL;
    const response = await axios.get(
      `${googleBooksApiUrl}?q=${encodeURIComponent(query)}`
    );
    //console.log(response);
    res.json(response.data);  
  } catch (error) {
    res.status(500).json({
      message: "Error fetching data from Google Books API",
      error: error.toString(),
    });
  }
});

app.get("/api/books/info/title/:title", async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Open Library URL
    const openLibrarySearchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}`;
    const response = await axios.get(openLibrarySearchUrl);

    // take the first result
    const firstResult = response.data.docs[0];
    if (!firstResult) {
      return res.status(404).json({ message: "Book not found" });
    }
    let coverUrl = "Unknown cover URL";
    if (firstResult.cover_i) {
      coverUrl = `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-M.jpg`;
    } else if (
      firstResult.cover_edition_key ||
      (firstResult.edition_key && firstResult.edition_key.length > 0)
    ) {
      const olid = firstResult.cover_edition_key || firstResult.edition_key[0];
      coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
    }

    const bookInfo = {
      title: firstResult.title,
      authors: firstResult.author_name
        ? firstResult.author_name.join(", ")
        : "Unknown Author",
      publishDate: firstResult.publish_date
        ? firstResult.publish_date[0]
        : "Unknown Publish Date",
      publisher: firstResult.publisher
        ? firstResult.publisher.join(", ")
        : "Unknown Publisher",
      isbn: firstResult.isbn ? firstResult.isbn[0] : "Unknown ISBN",
      numberOfPages: firstResult.number_of_pages_median || "Unknown Page Count",
      newCoverUrl: coverUrl,
    };

    res.json(bookInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error fetching data from Open Library",
      error: error.toString(),
    });
  }
});

//Get books endpoint
app.get("/api/books", async (req, res) => {
  const username = req.query.username;

  //checks if valid username, finds corresponding userId
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;
    // Finds all books with that userId
    const books = await Book.find({ userId: userId });
    res.json(books);
  } catch (error) {
    res.status(500).send("Error retrieving the user's books: " + error.message);
  }
});

app.get("/api/userinfo", async (req, res) => {
  const username = req.query.username; // Receive username

  try {
    // Find user by username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userInfo = {
      username: user.username,
      imageUrl: user.imageUrl,
    };

    res.json(userInfo);
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving user information",
      message: error.message,
    });
  }
});

//Add new book endpoint
app.post("/api/books", async (req, res) => {
  const {
    title,
    authors,
    publishedDate,
    thumbnail,
    description,
    pageCount,
    height,
    length,
    width,
    isbn,
    readStatus,
    readFormat,
    audioLength,
    ebookPageCount,
    username,
    startDate,
    endDate,
    readYear,
    dateFormat,
  } = req.body;
  console.log("Received ISBN:", isbn); // Log the ISBN received
  console.log("Received username:", username); // Log the username received
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    //section sees if user with isbn already exists

    const existingBook = await Book.findOne({ isbn: isbn, userId: userId });
    if (existingBook) {
      // If a book with the same ISBN for this user exists, return a conflict status (409)
      return res.status(409).send("ISBN already exists for the user");
    }

    const fixedEndDate =
      readStatus === "reading" ? null : endDate ? new Date(endDate) : null;
    let book = new Book({
      title,
      authors,
      publishedDate,
      thumbnail,
      description,
      pageCount,
      height,
      length,
      width,
      isbn,
      readStatus,
      readFormat,
      audioLength,
      ebookPageCount,
      userId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: fixedEndDate,
      readYear: readYear || null,
      dateFormat,
    });

    book = await book.save();
    res.send(book);
  } catch (error) {
    res.status(500).send("Error saving the book: " + error.message);
  }
});

//Edit book endpoint
app.patch("/api/books/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { username, ...updateData } = req.body;
  console.log("Received ISBN:", isbn); // Log the ISBN received
  console.log("Received username:", username); // Log the username received
  try {
    // Find the user to make sure they exist and get the userId

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // Find the book by ISBN and userId and update it with the new details
    let book = await Book.findOneAndUpdate(
      { isbn, userId },
      { $set: updateData },
      { new: true } // option returns the document after update was applied
    );

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.send(book);
  } catch (error) {
    res.status(500).send("Error updating the book: " + error.message);
  }
});

//Delete book endpoint
app.delete("/api/books/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { username } = req.body;
  console.log("Received ISBN to delete:", isbn);
  console.log("Received username:", username);

  try {
    // find the user to make sure they exist
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // Attempt to delete the book by ISBN and userId
    const deletionResult = await Book.deleteOne({ isbn, userId });

    // Check if a book was actually deleted
    if (deletionResult.deletedCount === 0) {
      return res.status(404).send("Book not found");
    }

    res.send({ message: "Book successfully deleted" });
  } catch (error) {
    res.status(500).send("Error deleting the book: " + error.message);
  }
});

// New user Creation
app.post("/api/new-user", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Both Username and password are required" });
    }

    let user = await User.findOne({ username });

    if (user) {
      return res.status(409).json({ message: "Username already exists" });
    } else {
      user = new User({ username, password });
      await user.save();
      res.status(201).json({
        message: "User created and logged in",
        user: { username: user.username },
      }); // send only the username back
    }
  } catch (error) {
    res.status(500).json({
      message: "Error during new user creation",
      error: error.toString(),
    });
  }
});

app.patch("/api/userinfo", async (req, res) => {
  const { currentUsername, newUsername, imageUrl, newPassword } = req.body;

  try {
    // Find the current user by their username
    const user = await User.findOne({ username: currentUsername });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new username is already in use
    if (newUsername && newUsername !== currentUsername) {
      const usernameExists = await User.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(409).json({ message: "Username already taken" });
      }
      user.username = newUsername; // Update the username
    }

    // Update imageUrl if provided
    if (imageUrl) {
      user.imageUrl = imageUrl;
    }

    // Update the new password if provided
    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user info", error: error.toString() });
  }
});

//User login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Both username and password are required" });
    }

    let user = await User.findOne({ username });
    if (user) {
      // Compares submitted password with hash that is stored
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.status(200).json({
          message: "Login successful",
          user: { username: user.username, darkMode: user.darkMode },
        });
      } else {
        res.status(401).json({ message: "Incorrect Credentials" });
      }
    } else {
      res.status(404).json({ message: "Username not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login process", error: error.toString() });
  }
});

app.get("/api/reading", async (req, res) => {
  const username = req.query.username;

  try {
    // Checks if valid username, finds corresponding userId
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;

    // Finds all books with that userId where readStatus is 'reading'
    const books = await Book.find({ userId: userId, readStatus: "reading" });
    res.json(books);
  } catch (error) {
    res.status(500).send("Error retrieving the user's books: " + error.message);
  }
});

app.patch("/api/updatePage", async (req, res) => {
  const { bookId, currentPage } = req.body;
  const pagesInt = parseInt(currentPage, 10);

  if (!bookId || isNaN(pagesInt)) {
    return res.status(400).json({
      message:
        "Book ID and current page must be provided and current page must be a number",
    });
  }

  try {
    const book = await Book.findByIdAndUpdate(
      bookId,
      { currentPage: pagesInt },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Page updated successfully", book: book });
  } catch (error) {
    console.error("Error updating page:", error);
    res
      .status(500)
      .json({ message: "Failed to update the page", error: error.toString() });
  }
});

app.get("/api/friends", async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username }).populate(
      "friends",
      "username imageUrl"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ friends: user.friends });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving friends", error: error.toString() });
  }
});

app.get("/api/friends/requests", async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username }).populate(
      "requestsReceived",
      "username imageUrl"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ requests: user.requestsReceived });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving friend requests",
      error: error.toString(),
    });
  }
});

app.post("/api/friends/accept", async (req, res) => {
  const { username, requesterId } = req.body;

  try {
    const user = await User.findOne({ username });
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends.push(requester._id);
    user.requestsReceived.pull(requester._id);
    requester.friends.push(user._id);
    requester.requestsSent.pull(user._id);

    await user.save();
    await requester.save();

    res.json({
      message: "Friend request accepted",
      friend: { username: requester.username, imageUrl: requester.imageUrl },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting friend request",
      error: error.toString(),
    });
  }
});

app.post("/api/friends/decline", async (req, res) => {
  const { username, requesterId } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.requestsReceived.pull(requesterId);
    await user.save();

    res.json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({
      message: "Error declining friend request",
      error: error.toString(),
    });
  }
});

app.get("/api/users/search", async (req, res) => {
  const { search } = req.query;
  const limit = 5;
  try {
    const users = await User.find({ username: new RegExp(`^${search}`, "i") })
      .select("username imageUrl")
      .limit(limit);
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching for users", error: error.toString() });
  }
});

app.post("/api/friends/send-request", async (req, res) => {
  const { fromUsername, toUsername } = req.body;

  try {
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    if (
      toUser.requestsReceived.includes(fromUser._id) ||
      fromUser.friends.includes(toUser._id)
    ) {
      return res
        .status(409)
        .json({ message: "Request already sent or users are already friends" });
    }

    toUser.requestsReceived.push(fromUser._id);
    fromUser.requestsSent.push(toUser._id);

    await toUser.save();
    await fromUser.save();

    res.status(200).json({
      message: "friend request sent successfully",
      recipient: { username: toUser.username, imageUrl: toUser.imageUrl },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending friend request",
      error: error.toString(),
    });
  }
});

app.get("/api/pages-read/:year", async (req, res) => {
  const { year } = req.params;
  const { username } = req.query;
  const yearInt = parseInt(year, 10);

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

    // find books that belong to the user and matchs the year criteria
    const books = await Book.find({
      userId: userId, // Ensure the book is for user
      $or: [
        {
          readYear: yearInt,
          dateFormat: "year", // check the readYear if dateFormat is "year"
        },
        {
          startDate: { $lte: new Date(`${year}-12-31`) },
          endDate: { $gte: new Date(`${year}-01-01`) },
          dateFormat: "date", // Check startDate endDate if dateFormat is "date"
        },
      ],
    });

    let totalPages = 0;
    books.forEach((book) => {
      if (book.dateFormat === "year" && book.readYear === yearInt) {
        totalPages += book.pageCount;
      } else if (book.dateFormat === "date") {
        const start = new Date(
          Math.max(
            new Date(book.startDate).getTime(),
            new Date(`${year}-01-01`).getTime()
          )
        );
        const end = new Date(
          Math.min(
            new Date(book.endDate).getTime(),
            new Date(`${year}-12-31`).getTime()
          )
        );
        const daysRead = (end - start) / (1000 * 60 * 60 * 24) + 1; // end - start gives miliseconds between 2 dates, divide to get days.

        const totalDays =
          (new Date(book.endDate) - new Date(book.startDate)) /
            (1000 * 60 * 60 * 24) +
          1;
        totalPages += Math.round((daysRead / totalDays) * book.pageCount);
      }
    });

    res.json({ year: yearInt, totalPages: totalPages });
  } catch (error) {
    console.error("Error fetching pages read:", error);
    res.status(500).json({
      message: "Failed to calculate pages read",
      error: error.toString(),
    });
  }
});

app.patch("/api/user/settings", async (req, res) => {
  const { username, darkMode } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { $set: { darkMode: darkMode } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({ message: "Settings updated", user: user });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

app.post("/api/bookclub/create", async (req, res) => {
  const { name, bookId, username, startDate, endDate } = req.body;

  try {
    // Find the admin user based on username
    const admin = await User.findOne({ username: username });
    if (!admin) {
      return res.status(404).json({ message: "Username Not found" });
    }

    // Find the book based on book ID
    const book = await Book.findById(bookId); //Maybe switch to ISBN. Allow mutiple copies of books per user.
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Create a new Book Club
    const newBookClub = new BookClub({
      name,
      book: book._id,
      members: [admin._id],
      admin: admin._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    // Save the new Book Club to the database
    await newBookClub.save();

    // Respond with the new bookclub
    res.status(201).json(newBookClub);
  } catch (error) {
    console.error("Failed to create bookclub:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/bookclub/check-membership", async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the bookclub, populate book and members for return.
    const bookClub = await BookClub.findOne({ members: user._id })
    .populate('book')
    .populate({
      path: 'members',
      select: 'username imageUrl'
    })
    .populate({
      path: 'messageBoard.postedBy',
      select: 'username'
    });

    console.log("BookClub Members:", bookClub.members.map(member => ({
      username: member.username,
      imageUrl: member.imageUrl
    })));

    if (!bookClub) {
      return res.status(200).json({
        isMember: false
      });
    }
    //Finds users version of the book to also return
    const userBook = await Book.findOne({ isbn: bookClub.book.isbn, userId: user._id });

    res.status(200).json({
      isMember: true,
      bookClub: bookClub,
      book: userBook || null,
      members: bookClub.members,
      messageBoard: bookClub.messageBoard.map(message => ({
        message: message.message,
        postedBy: message.postedBy.username,
        postedAt: message.postedAt
      }))
    });

  } catch (error) {
    console.error("Failed to check for bookclub:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/bookclub/search", async (req, res) => {
  const { search } = req.query;
  const limit = 5;
  try {
    const bookclubs = await BookClub.find({
      name: new RegExp(`^${search}`, "i"),
    })
      .select("name")
      .limit(limit);
    res.json(bookclubs);
  } catch (error) {
    res.status(500).json({
      message: "Error searching for bookclubs",
      error: error.toString(),
    });
  }
});

app.patch("/api/bookclub/join", async (req, res) => {
  const { username, bookClubName } = req.query;
  //console.log("starting");
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const bookclub = await BookClub.findOne({ name: bookClubName }).populate(
      "book"
    );
    if (!bookclub) {
      return res.status(404).send("BookClub not found");
    }
    if (bookclub.members.includes(user._id)) {
      return res.status(409).send("User already a member");
    }

    bookclub.members.push(user._id);
    await bookclub.save();

    const { book } = bookclub;
    const existingBook = await Book.findOne({
      isbn: book.isbn,
      userId: user._id,
    });

    if (existingBook) {
      // If the book already exists for the user, do not add a new entry
      res
        .status(200)
        .json({
          message: "Joined book club, but book already exists in your library",
          BookClub: bookclub,
          book: null,
        });
    } else {
      // Create a new book entry for the user
      let newBook = new Book({
        title: bookclub.book.title,
        authors: bookclub.book.authors,
        publishedDate: bookclub.book.publishedDate,
        thumbnail: bookclub.book.thumbnail,
        description: bookclub.book.description,
        pageCount: bookclub.book.pageCount,
        height: bookclub.book.height,
        length: bookclub.book.length,
        width: bookclub.book.width,
        isbn: bookclub.book.isbn,
        readStatus: "reading",
        readFormat: bookclub.book.readFormat,
        audioLength: bookclub.book.audioLength,
        ebookPageCount: bookclub.book.ebookPageCount,
        userId: user._id,
        startDate: bookclub.startDate,
        readYear: null,
        dateFormat: "date",
      });
      newBook = await newBook.save();
      res
        .status(201)
        .json({
          message: "Joined book club and book added to your library",
          BookClub: bookclub,
          book: newBook,
        });
    }
  } catch (error) {
    console.error("Error joining book club or adding book:", error);
    res.status(500).send("Error: " + error.message);
  }
});

app.post('/api/bookclub/:id/message', async (req, res) => {
  const { message, username } = req.body;

  try {
    // find the user ID based on the username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;

    // add the message to the book club message board
    const bookClub = await BookClub.findByIdAndUpdate(
      req.params.id,
      { $push: { messageBoard: { message, postedBy: userId } } },
      { new: true }
    ).populate({
      path: 'messageBoard.postedBy',
      select: 'username'
    });

    res.status(201).json(bookClub.messageBoard);
  } catch (error) {
    res.status(400).json({ message: 'Error posting message', error });
  }
});







//Need .get for bookclub/search
//Need .patch for bookclub/leave
//Need .patch for bookclub/updateSettings
//Need .get for bookclun/userReadProgrogress

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;