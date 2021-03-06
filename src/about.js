import { createElement } from "./utils";
import { activeElement, removeActiveElement } from "./app";

var aboutButton = document.querySelector("[data-name='about']");
export const aboutSection = document.getElementById("about");

export function run() {
  aboutButton.textContent = "×";
  aboutButton.classList.add("close-button");

  aboutSection.style.display = "block";

  window.onload = () => {
    document.querySelectorAll(".large-filter").forEach(function (icon) {
      if (icon.id === "large-octagram") {
        initShowcaseItems(icon, ["61", "58", "18", "22"]);
      } else if (icon.id === "large-doublecross") {
        initShowcaseItems(icon, ["66", "6", "59"]);
      } else {
        initShowcaseItems(icon, ["11", "82", "68", "41"]);
      }
    });
  };
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

document.querySelectorAll(".large-filter").forEach((filter) => {
  filter.onclick = () => {
    console.log("hello");
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
});

export function toggleBackgroundBlur() {
  document
    .querySelectorAll(
      ".floating-element, .tag, .filters, .scale-container, .buttons"
    )
    .forEach(function (bgElement) {
      bgElement.classList.toggle("blur");
    });
}

function initShowcaseItems(icon, idList) {
  const iconItems = [];

  idList.forEach((id) => {
    var itemA = document.getElementById(id);
    if (itemA) {
      var showcaseItem = createElement("img", {
        classList: ["showcase-item"],
        src: "images/" + itemA.querySelector("img").src.split("/")[4],
        style: {
          position: "absolute",
          left: itemA.style.left,
          top: itemA.style.top,
          width: itemA.offsetWidth + "px",
          transition: "transform 0.2s",
        },
      });

      iconItems.push(showcaseItem);
    }
  });

  icon.onmouseenter = function () {
    iconItems.forEach((showcaseItem) => {
      document.body.appendChild(showcaseItem);
      showcaseItem.classList.remove("blur");

      setTimeout(function () {
        showcaseItem.style.transform = "scale(10)";
        showcaseItem.style.zIndex = "5";
      }, 100);
    });
  };

  icon.onfocus = function () {
    iconItems.forEach((showcaseItem) => {
      document.body.appendChild(showcaseItem);
      showcaseItem.classList.remove("blur");

      setTimeout(function () {
        showcaseItem.style.transform = "scale(10)";
        showcaseItem.style.zIndex = "5";
      }, 100);
    });
  };

  icon.onmouseleave = function () {
    iconItems.forEach((showcaseItem) => {
      showcaseItem.style.transform = "scale(1)";
      showcaseItem.style.zIndex = "1";
      showcaseItem.classList.add("blur");
      if (showcaseItem.parentNode) {
        document.body.removeChild(showcaseItem);
      }
      //add 200s timeout if mouseleave issue gets fixes
    });
  };

  icon.onblur = function () {
    iconItems.forEach((showcaseItem) => {
      showcaseItem.style.transform = "scale(1)";
      showcaseItem.style.zIndex = "1";
      showcaseItem.classList.add("blur");
      setTimeout(function () {
        if (showcaseItem.parentNode) {
          document.body.removeChild(showcaseItem);
        }
      }, 200);
    });
  };
}

export function colorButton() {
  aboutButton.style.backgroundColor = "#73FFAD";
}

export function removeButtonColor() {
  aboutButton.style.backgroundColor = "transparent";
}
