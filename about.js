(function () {
  "use strict";
  window.app = window.app || {};

  var aboutButton = document.querySelector("[data-name='about']");
  var aboutSection = document.getElementById(aboutButton.dataset.name);

  aboutButton.textContent = "×";
  aboutButton.classList.add("close-button");

  aboutSection.style.display = "block";

  toggleBackgroundBlur();

  document.querySelectorAll(".large-filter").forEach(function (icon) {
    if (icon.id === "large-octagram") {
      initShowcaseItems(icon, ["65"]);
    } else if (icon.id === "large-doublecross") {
      initShowcaseItems(icon, ["6"]);
    } else {
      initShowcaseItems(icon, ["91"]);
    }
  });

  aboutButton.onclick = function () {
    if (aboutSection.style.display === "block") {
      aboutButton.classList.remove("close-button");
      aboutButton.textContent = "About";

      toggleBackgroundBlur();

      aboutSection.style.display = "none";
    } else {
      aboutButton.classList.add("close-button");
      aboutButton.textContent = "×";

      toggleBackgroundBlur();

      aboutSection.style.display = "block";
    }
  };

  function toggleBackgroundBlur() {
    document
      .querySelectorAll(".floating-element, .tag, .filters")
      .forEach(function (bgElement) {
        bgElement.classList.toggle("blur");
      });
  }

  function initShowcaseItems(icon, idList) {
    var itemA = document.getElementById(idList[0]);
    var showcaseItem = createElement("img", {
      src: itemA.src,
      style: {
        position: "absolute",
        left: itemA.style.left,
        top: itemA.style.top,
        width: itemA.offsetWidth + "px",
        transition: "transform 0.2s",
      },
    });

    icon.onmouseenter = function () {
      showcaseItem.style.left = itemA.style.left;
      showcaseItem.style.top = itemA.style.top;
      document.body.appendChild(showcaseItem);
      showcaseItem.classList.remove("blur");

      setTimeout(function () {
        showcaseItem.style.transform = "scale(5)";
        showcaseItem.style.zIndex = "5";
      }, 100);
    };

    icon.onfocus = function () {
      showcaseItem.style.left = itemA.style.left;
      showcaseItem.style.top = itemA.style.top;
      document.body.appendChild(showcaseItem);
      showcaseItem.classList.remove("blur");

      setTimeout(function () {
        showcaseItem.style.transform = "scale(5)";
        showcaseItem.style.zIndex = "5";
      }, 100);
    };

    icon.onmouseleave = function () {
      showcaseItem.style.transform = "scale(1)";
      showcaseItem.style.zIndex = "1";
      showcaseItem.classList.add("blur");
    };

    icon.onblur = function () {
      showcaseItem.style.transform = "scale(1)";
      showcaseItem.style.zIndex = "1";
      showcaseItem.classList.add("blur");
    };
  }

  function createElement(tag, properties = {}) {
    var element = document.createElement(tag);
    if (properties.id) {
      element.id = properties.id;
    }
    if (properties.classList) {
      properties.classList.forEach(function (c) {
        element.classList.add(c);
      });
    }
    if (properties.src) {
      element.src = properties.src;
    }
    if (properties.textContent) {
      element.textContent = properties.textContent;
    }
    if (properties.onload) {
      element.onload = properties.onload;
    }

    if (properties.onclick) {
      element.onclick = properties.onclick;
    }
    if (properties.onmouseenter) {
      element.onmouseenter = properties.onmouseenter;
    }
    if (properties.onmouseleave) {
      element.onmouseleave = properties.onmouseleave;
    }
    if (properties.onwheel) {
      element.onwheel = properties.onwheel;
    }
    if (properties.href) {
      element.href = properties.href;
    }
    if (properties.target) {
      element.target = properties.target;
    }
    if (properties.dataset) {
      Object.keys(properties.dataset).forEach(function (key) {
        element.dataset[key] = properties.dataset[key];
      });
    }
    if (properties.style) {
      Object.keys(properties.style).forEach(function (key) {
        element.style[key] = properties.style[key];
      });
    }
    return element;
  }
})();
