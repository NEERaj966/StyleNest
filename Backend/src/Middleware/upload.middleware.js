import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join(
  process.cwd(),
  "public",
  "temp"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});

const TEMP_FILE_MAX_AGE = 60 * 60 * 1000;

const cleanTempFiles = () => {
  fs.readdir(uploadDir, (error, files) => {
    if (error) return;

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);

      fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) return;

        const fileAge = now - stats.mtimeMs;

        if (fileAge > TEMP_FILE_MAX_AGE) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};

cleanTempFiles();

setInterval(cleanTempFiles, 30 * 60 * 1000);