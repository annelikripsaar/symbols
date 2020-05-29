const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
const imageminPngquant = require("imagemin-pngquant");

imagemin(["images/*.png"], "images", {
  use: [imageminPngquant()],
}).then((results) => {
  console.log(results.length + " images optimized");
});

imagemin(["images/*.png"], "images", {
  use: [imageminWebp()],
}).then((results) => {
  console.log(results.length + " images reformatted");
});

imagemin(["thumbnails/*.png"], "thumbnails", {
  use: [imageminPngquant()],
}).then((results) => {
  console.log(results.length + " thumbnails optimized");
});

imagemin(["thumbnails/*.png"], "thumbnails", {
  use: [imageminWebp()],
}).then((results) => {
  console.log(results.length + " thumbnails reformatted");
});
