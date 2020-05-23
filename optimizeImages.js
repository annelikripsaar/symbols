const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");

imagemin(["images/*.png"], "images", {
  use: [imageminWebp()],
}).then((results) => {
  console.log(results.length + " images optimized");
  imagemin(["thumbnails/*.png"], "thumbnails", {
    use: [imageminWebp()],
  }).then((results) => {
    console.log(results.length + " thumbnails optimized");
  });
});
