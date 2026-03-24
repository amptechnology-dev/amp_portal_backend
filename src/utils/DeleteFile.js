import fs from "fs";

export default function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err}`);
      return;
    }
    console.log(`${filePath} has been deleted successfully.`);
  });
}
