(function () {
  "use strict";
  window.app = window.app || {};

  var items = window.app.data;
  var activeElement;
  var container = document.getElementById("floating-elements");
  var activeElementContainer = document.getElementById("active-element");

  var panzoomMap = Panzoom(container, {
    maxScale: 5,
    contain: "outside",
    cursor: "crosshair",
  });

  var panzoomActiveImage = Panzoom(activeElementContainer, {
    maxScale: 5,
    contain: "inside",
  });

  var ESCAPE_KEYCODE = 27;
  var ANIMATION_TIME = 200;

  main();

  function main() {
    initActiveElementRemoval();
    items.forEach(createItem);
    initPanZoom();
  }

  function initActiveElementRemoval() {
    activeElementContainer.addEventListener("click", removeActiveElement);
    window.addEventListener("keydown", function () {
      if (event.keyCode == ESCAPE_KEYCODE) {
        removeActiveElement();
      }
    });
  }

  function removeActiveElement() {
    if (activeElement) {
      removeCentered(activeElement);
      activeElement = null;
      activeElementContainer.style.display = "none";
    }
  }

  function initPanZoom() {
    container.addEventListener("wheel", panzoomMap.zoomWithWheel);
  }

  function createItem(item) {
    var element = createElement(item.image ? "img" : "p", {
      id: item.id,
      textContent: item.image ? null : item.name,
      src: item.image ? "images/" + item.image + ".png" : null,

      onmouseenter() {
        setActiveShortInfo(item);
      },

      onmouseleave() {
        clearActiveShortInfo();
      },

      onclick: item.image
        ? function (event) {
            event.stopPropagation();
            selectItem(element, item);
          }
        : null,
    });

    container.appendChild(element);

    if (element.tagName.toLowerCase() === "img") {
      element.style.opacity = "0";
      element.onload = function () {
        positionElement(element, container);
        element.style.opacity = "1";
        if (activeElement) {
          element.classList.add("blur");
        }
      };
    } else {
      positionElement(element, container);
    }
  }

  function selectItem(element, item) {
    element.style.display = "none";

    var activeImageElement = createActiveImageElementFromSelected(
      element,
      item
    );
    activeElementContainer.style.display = "block";
    activeElementContainer.appendChild(activeImageElement);

    activeImageElement.style.transform = getWindowFitTransform(
      activeImageElement
    );

    if (item.image) {
      setTimeout(() => {
        handleHighlighting(
          "images/" + item.image + "_highlight.png",
          activeImageElement,
          item
        );
      }, ANIMATION_TIME);
    }

    document
      .querySelectorAll(".floating-element")
      .forEach(function (bgElement) {
        bgElement.classList.add("blur");
      });

    panzoomMap.setOptions({
      disableZoom: true,
    });

    activeImageElement.addEventListener(
      "wheel",
      panzoomActiveImage.zoomWithWheel
    );

    activeElement = activeImageElement;
    setActiveLongInfo(item);
  }

  function getWindowFitTransform(element) {
    var heightRatio = window.innerHeight / element.offsetHeight;
    var widthRatio = window.innerWidth / element.offsetWidth;
    var padding = 2;

    if (heightRatio < widthRatio) {
      return (
        "translate(-50%, -50%) scale(" +
        (heightRatio - padding) +
        ", " +
        (heightRatio - padding) +
        ")"
      );
    } else {
      return (
        "translate(-50%, -50%) scale(" +
        (widthRatio - padding) +
        ", " +
        (widthRatio - padding) +
        ")"
      );
    }
  }

  async function handleHighlighting(src, activeImageElement, item) {
    var bounds = activeImageElement.getBoundingClientRect();
    var highlight = createElement("div", {
      id: "highlight-container",
      classList: ["highlight"],
      style: {
        position: "fixed",
        zIndex: 3,
        width: bounds.width + "px",
        height: bounds.height + "px",
        left: bounds.left + "px",
        top: bounds.top + "px",
      },
      onwheel() {
        document.getElementById("highlight-container").style.pointerEvents =
          "none";
      },
    });
    activeElementContainer.appendChild(highlight);
    var highlightImage = await loadImage(src);

    var hitArea = saveImageWithHitArea(highlightImage, {
      container: highlight.id,
      x: bounds.left,
      y: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });
    hitArea.on("mouseover", function () {
      createFootnote(activeImageElement, item);
    });
    hitArea.on("mouseout", clearFootnote);
  }

  function loadImage(src) {
    var image = new Image();
    return new Promise(function (resolve) {
      image.src = src;
      image.onload = function (event) {
        resolve(event.target);
      };
    });
  }

  function createActiveImageElementFromSelected(element, item) {
    var activeImageElement = createElement("img", {
      src: element.src,
      dataset: {
        original: element.id,
      },
      style: {
        left: element.style.left,
        top: element.style.top,
        transform: "translate(-50%, -50%)",
        opacity: 0,
      },
      classList: ["centered"],

      onload() {
        activeImageElement.style.opacity = 1;
      },
    });
    return activeImageElement;
  }

  function removeCentered(element) {
    var highlight = document.querySelector(".highlight");
    highlight.parentNode.removeChild(highlight);

    element.style.transform = "translate(-50%,-50%) scale(0, 0)";

    setTimeout(function () {
      element.parentNode.removeChild(element);
      var original = document.getElementById(element.dataset.original);
      original.style.display = "block";
    }, ANIMATION_TIME);

    clearActiveLongInfo();

    document
      .querySelectorAll(".floating-element")
      .forEach(function (bgElement) {
        bgElement.classList.remove("blur");
      });

    panzoomMap.setOptions({
      disableZoom: false,
    });
  }

  function positionElement(element, container) {
    element.classList.add("floating-element");
    element.style.top =
      Math.random() * (container.offsetHeight - element.offsetHeight) + "px";
    element.style.left =
      Math.random() * (container.offsetWidth - element.offsetWidth) + "px";
  }

  function createFootnote(centeredElement, item) {
    var footnote = createElement("p", {
      id: "footnote",
      classList: ["footnote"],
      textContent: item.footnote,
      style: {
        transform:
          "translate(" +
          (parseFloat(centeredElement.getBoundingClientRect().left) +
            parseFloat(centeredElement.getBoundingClientRect().width)) +
          "px, " +
          (parseFloat(centeredElement.getBoundingClientRect().top) +
            parseFloat(centeredElement.getBoundingClientRect().height)) +
          "px)",
      },
    });
    activeElementContainer.appendChild(footnote);
  }

  function clearFootnote() {
    var footnote = document.getElementById("footnote");
    footnote.parentElement.removeChild(footnote);
  }

  function setActiveShortInfo(item) {
    var infoContainer = document.getElementById("info");
    var fields = [item.location, item.dating];

    fields.forEach(function (field) {
      infoContainer.appendChild(
        createElement("p", {
          textContent: field,
        })
      );
    });
  }

  function clearActiveShortInfo() {
    var infoContainer = document.getElementById("info");
    infoContainer.textContent = "";
  }

  function setActiveLongInfo(item) {
    var longInfoContainer = document.getElementById("long-info");

    var fields = [item.location, item.dating, item.material, item.size];
    fields.filter(Boolean).forEach(function (field) {
      longInfoContainer.appendChild(
        createElement("p", {
          textContent: field,
        })
      );
    });
    var creditLink = createElement("a", {
      textContent: item.credit,
      href: item.link,
      target: "_blank",
    });
    longInfoContainer.appendChild(creditLink);
  }

  function clearActiveLongInfo() {
    var infoContainer = document.getElementById("long-info");
    infoContainer.textContent = "";
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

  function saveImageWithHitArea(image, container) {
    var stage = new Konva.Stage({
      container: container.container,
      width: container.width,
      height: container.height,
    });
    var layer = new Konva.Layer();
    var area = new Konva.Image({
      image,
      x: 0,
      y: 0,
      width: container.width,
      height: container.height,
    });

    area.cache();
    area.drawHitFromCache();

    layer.add(area);
    stage.add(layer);
    return area;
  }
})();
