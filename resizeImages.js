const path = require("path");
const fs = require("fs");

const sharp = require("sharp");

const directoryPath = path.join(__dirname, "images");
const newDirectoryPath = path.join(__dirname, "thumbnails");

async function main() {
  const files = await fs.promises.readdir(directoryPath);
  files
    .filter((file) => !file.includes("highlight"))
    .forEach(function (file) {
      sharp(path.join(directoryPath, file))
        .resize(500)
        .toFile(path.join(newDirectoryPath, file));
    });
}

main();
