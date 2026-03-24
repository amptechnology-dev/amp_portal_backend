import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { configDotenv } from "dotenv";

configDotenv();
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (fileBuffer, fileName, mimeType) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };
  await r2.send(new PutObjectCommand(params));
  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
};

export const deleteFromR2 = async (fileName) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  await r2.send(new DeleteObjectCommand(params));
  return true;
};
