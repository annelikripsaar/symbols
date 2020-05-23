import { createElement } from "./utils";

var aboutButton = document.querySelector("[data-name='about']");
var aboutSection = document.getElementById(aboutButton.dataset.name);

export function run() {
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
}

aboutButton.onclick = function () {
  aboutButton.blur();
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
    .querySelectorAll(".floating-element, .tag, .filters, .scale-container")
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
    setTimeout(function () {
      if (showcaseItem.parentNode) {
        document.body.removeChild(showcaseItem);
      }
    }, 1000);
  };

  icon.onblur = function () {
    showcaseItem.style.transform = "scale(1)";
    showcaseItem.style.zIndex = "1";
    showcaseItem.classList.add("blur");
    setTimeout(function () {
      if (showcaseItem.parentNode) {
        document.body.removeChild(showcaseItem);
      }
    }, 1000);
  };
}
