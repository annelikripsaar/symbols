(function () {
  "use strict";
  window.app = window.app || {};

  var aboutButton = document.querySelector("[data-name='about']");
  var aboutSection = document.getElementById(aboutButton.dataset.name);

  aboutSection.style.display = "block";

  document
    .querySelectorAll(".floating-element, .tag, .filters")
    .forEach(function (bgElement) {
      bgElement.classList.add("blur");
    });

  aboutButton.onclick = function () {
    if (aboutSection.style.display === "block") {
      document
        .querySelectorAll(".floating-element, .tag, .filters")
        .forEach(function (bgElement) {
          bgElement.classList.remove("blur");
        });

      aboutSection.style.display = "none";
    } else {
      document
        .querySelectorAll(".floating-element, .tag, .filters")
        .forEach(function (bgElement) {
          bgElement.classList.add("blur");
        });

      aboutSection.style.display = "block";
    }
  };
})();
