require("dotenv").config(); //needed for using .env

//const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

//const s3Client = new S3Client({ region: process.env.AWS_REGION });
/*
async function uploadImageToS3(file) {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    //ACL: "public-read", // Adjust according to your privacy requirements
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(uploadParams));
    return result; // Contains URL of the uploaded file if successful
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}*/


const express = require('express');
const { S3Client, GetObjectCommand, PutObjectCommand, createPresignedPost } = require("@aws-sdk/client-s3");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const s3Client = new S3Client({ region: process.env.AWS_REGION });

app.post('/generate-presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body; // Expect fileName and fileType from the client

  // Ensure you validate fileName and fileType as per your application's requirements

  try {
    // Adjust Bucket and Key according to your needs
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      ContentType: fileType,
      Expires: 60, // URL expiry time in seconds
    };

    // Generate a pre-signed PUT URL for the file
    const command = new PutObjectCommand(params);
    const presignedUrl = await s3Client.getSignedUrl(command, { expiresIn: 3600 }); // URL expires in 1 hour

    res.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).send("Failed to generate pre-signed URL.");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





module.exports = { uploadImageToS3 };