import { createElement } from "./utils";
import { activeElement, removeActiveElement } from "./app";

var aboutButton = document.querySelector("[data-name='about']");
export const aboutSection = document.getElementById("about");

export function run() {
  aboutButton.textContent = "×";
  aboutButton.classList.add("close-button");

  aboutSection.style.display = "block";

  document.querySelectorAll(".large-filter").forEach(function (icon) {
    if (icon.id === "large-octagram") {
      initShowcaseItems(icon, ["58"]);
    } else if (icon.id === "large-doublecross") {
      initShowcaseItems(icon, ["19"]);
    } else {
      initShowcaseItems(icon, ["83"]);
    }
  });
}

aboutButton.onclick = function () {
  aboutButton.blur();
  if (aboutSection.style.display === "block") {
    aboutButton.classList.remove("close-button");
    aboutButton.textContent = "Tracing Ties";
    aboutButton.onmouseenter = () => colorButton();
    aboutButton.onmouseleave = () => removeButtonColor();

    toggleBackgroundBlur();
    aboutSection.style.display = "none";
  } else {
    if (activeElement) {
      aboutButton.onmouseenter = () => colorButton();
      aboutButton.onmouseleave = () => removeButtonColor();

      removeActiveElement();
    } else {
      aboutButton.classList.add("close-button");
      aboutButton.textContent = "×";
      aboutButton.onmouseenter = () => removeButtonColor();

      toggleBackgroundBlur();

      aboutSection.style.display = "block";
    }
  }
};

aboutSection.onclick = (event) => {
  if (event.target !== aboutSection) {
    return;
  }
  document.querySelectorAll(".showcase-item").forEach((showcaseItem) => {
    showcaseItem.parentNode.removeChild(showcaseItem);
  });

  aboutButton.classList.remove("close-button");
  aboutButton.textContent = "Tracing Ties";
  aboutButton.onmouseenter = () => colorButton();
  aboutButton.onmouseleave = () => removeButtonColor();
  toggleBackgroundBlur();
  aboutSection.style.display = "none";
};

export function toggleBackgroundBlur() {
  document
    .querySelectorAll(
      ".floating-element, .tag, .filters, .scale-container, #timeline-button"
    )
    .forEach(function (bgElement) {
      bgElement.classList.toggle("blur");
    });
}

function initShowcaseItems(icon, idList) {
  setTimeout(() => {
    var itemA = document.getElementById(idList[0]);
    if (itemA) {
      var showcaseItem = createElement("img", {
        classList: ["showcase-item"],
        src: itemA.querySelector("img").src,
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
  }, 500);
}

function colorButton() {
  aboutButton.style.backgroundColor = "#73FFAD";
}

export function removeButtonColor() {
  aboutButton.style.backgroundColor = "transparent";
}
