import Panzoom from "@panzoom/panzoom";
import { createElement } from "./utils";
import { aboutSection, toggleBackgroundBlur } from "./about";

var activeElement;
var activeHighlight;
var container = document.getElementById("floating-elements");
var activeElementContainer = document.getElementById("active-element");
var konvaStage;

var areas = {
  europe: {
    name: "Europe",
    x: [0.3, 0.5],
    y: [0.1, 0.5],
  },
  asia: {
    name: "Asia",
    x: [0.7, 0.95],
    y: [0.3, 0.7],
  },
  africa: {
    name: "Africa",
    x: [0.4, 0.6],
    y: [0.7, 0.8],
  },
  southamerica: {
    name: "South America",
    x: [0.1, 0.2],
    y: [0.7, 0.9],
  },
  northamerica: {
    name: "North America",
    x: [0.1, 0.2],
    y: [0.2, 0.4],
  },
  centralamerica: {
    name: "Central America",
    x: [0.1, 0.2],
    y: [0.5, 0.6],
  },
};

function addItemsToAreas(items, areas) {
  Object.values(areas).forEach(function (area) {
    area.items = items.filter(function (item) {
      return item.group === area.name;
    });
    tagArea(area, container);
  });
  return areas;
}

function clearAreas() {
  Object.values(areas).forEach(function (area) {
    area.items = [];
  });
  var tags = document.querySelectorAll(".tag");
  tags.forEach(function (tag) {
    tag.parentNode.removeChild(tag);
  });
}

var panzoomMap = Panzoom(container, {
  maxScale: 5,
  contain: "outside",
  cursor: "crosshair",
  panOnlyWhenZoomed: true,
  step: 0.1,
});

var panzoomActiveImage = Panzoom(activeElementContainer, {
  maxScale: 10,
  step: 0.1,
});

var ESCAPE_KEYCODE = 27;
var ANIMATION_TIME = 200;

export function run(items) {
  checkIfIE();

  initActiveElementRemoval();
  addItemsToAreas(items, areas);

  initPanZoom();

  initFilters();

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      initializeItems(items);
    });
    resizeObserver.observe(document.body);
  } else {
    toggleBackgroundBlur();
  }

  initializeItems(items);
}

function initializeItems(items) {
  clearAreas();
  clearAllItems();
  Object.values(areas).forEach(function (area) {
    tagArea(area, container);
  });
  items.forEach(createItem);

  if (aboutSection.style.display === "block" || activeElement) {
    document
      .querySelectorAll(".floating-element, .tag, .filters, .scale-container")
      .forEach(function (bgElement) {
        bgElement.classList.add("blur");
      });
    if (activeElement) {
      if (activeHighlight.parentNode) {
        activeHighlight.parentNode.removeChild(activeHighlight);
      }

      if (konvaStage) {
        konvaStage.destroy();
        konvaStage = null;
      }
      handleHighlighting(
        activeElement.querySelector("img"),
        items.find(
          (item) => item.id.toString() === activeElement.dataset.original
        )
      );
    }
  }
}

function initFilters() {
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (filter) {
    filter.onclick = function () {
      filter.blur();
      clearAreas();
      clearAllItems();
      if (filter.classList.contains("active-filter")) {
        filter.classList.remove("active-filter");
        addItemsToAreas(items, areas);
        items.forEach(createItem);
      } else {
        resetAllFilters(filters);
        filter.classList.add("active-filter");

        var filteredItems = items.filter(function (item) {
          var tags = item.tags.replace(" ", "").split(",");
          return tags.includes(filter.id);
        });

        addItemsToAreas(filteredItems, areas);
        filteredItems.forEach(createItem);
      }
    };
  });
}

function resetAllFilters(filters) {
  filters.forEach(function (filter) {
    filter.classList.remove("active-filter");
  });
}

function clearAllItems() {
  var elements = document.querySelectorAll(".floating-element");
  elements.forEach(function (element) {
    element.parentNode.removeChild(element);
  });
}

function initDisableClickWhilePanning() {
  container.addEventListener("panzoomstart", () => {
    setTimeout(function () {
      container.style.pointerEvents = "none";
    }, 100);
  });

  container.addEventListener("panzoomend", () => {
    container.style.pointerEvents = "initial";
  });

  container.addEventListener("click", () => {
    setTimeout(function () {
      container.style.pointerEvents = "initial";
    }, 100);

    if (activeElement) {
      removeCentered(activeElement);
      activeElement = null;
      activeElementContainer.style.display = "none";
    }
  });
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
  container.addEventListener("wheel", function () {
    displayCurrentScale(panzoomMap, 5);
  });
  initDisableClickWhilePanning();
}

function displayCurrentScale(zoomContainer, maxScale) {
  var currentScale =
    Math.floor((zoomContainer.getScale() / maxScale) * 100) + "%";
  var scaleContainer = document.getElementById("scale");
  scaleContainer.textContent = currentScale;
}

function tagArea(area, container) {
  var areaTag = createElement("p", {
    id: area,
    textContent: area.name + ": " + area.items.length,
    classList: ["tag"],
    style: {
      position: "absolute",
      left: area.x[0] * container.offsetWidth + "px",
      top: area.y[0] * container.offsetHeight + "px",
      transform: "translate(-100%, -100%)",
    },
  });
  container.appendChild(areaTag);
}

function createItem(item) {
  if (!item.image) {
    return null;
  }
  var element = createElement(
    "picture",
    {
      id: item.id,

      onmouseenter() {
        setActiveShortInfo(item);
      },

      onmouseleave() {
        clearActiveShortInfo();
      },

      onclick: function (event) {
        event.stopPropagation();
        selectItem(element, item);
        setTimeout(() => {
          container.style.pointerEvents = "initial";
        }, 101);
      },
    },
    [
      createElement("source", {
        srcset: "images/" + item.image + ".webp",
        type: "image/webp",
        style: {
          width: item.width * 0.1 * container.offsetWidth + "px",
        },
      }),
      createElement("img", {
        src: "thumbnails/" + item.image + ".png",
        style: {
          width: item.width * 0.1 * container.offsetWidth + "px",
        },
      }),
    ]
  );

  container.appendChild(element);

  if (element.offsetWidth < 100) {
    element.style.zIndex = 2;
  } else if (element.offsetWidth < 20) {
    element.style.zIndex = 3;
  }

  if (element.tagName.toLowerCase() === "img") {
    element.style.opacity = "0";
    element.onload = function () {
      positionElementByGroup(element, item, container);
      element.style.opacity = "1";
      if (activeElement || aboutSection.style.display === "block") {
        element.classList.add("blur");
      }
      if (activeElement) {
      }
    };
  } else {
    positionElementByGroup(element, item, container);
  }
}

function positionElementByGroup(element, item) {
  element.classList.add("floating-element");

  if (item.group) {
    Object.values(areas).forEach(function (area) {
      if (item.group === area.name) {
        positionInGroup(element, area, container);
      }
    });
  } else {
    element.style.display = "none";
  }
}

function positionInGroup(element, area, container) {
  element.style.left =
    getRandomPositionInContainerXRange(area.x, container) + "px";
  element.style.top =
    getRandomPositionInContainerYRange(area.y, container) + "px";
}

function getRandomPositionInContainerXRange(range, container) {
  var randomPosition = range[0] + Math.random() * (range[1] - range[0]);
  return randomPosition * container.offsetWidth;
}

function getRandomPositionInContainerYRange(range, container) {
  var randomPosition = range[0] + Math.random() * (range[1] - range[0]);
  return randomPosition * container.offsetHeight;
}

function selectItem(element, item) {
  element.style.display = "none";

  var activeImageElement = createActiveImageElementFromSelected(element, item);
  activeElementContainer.style.display = "block";
  activeElementContainer.appendChild(activeImageElement);

  displayCurrentScale(panzoomActiveImage, 10);

  document
    .querySelectorAll(".floating-element, .tag, .filters")
    .forEach(function (bgElement) {
      bgElement.classList.add("blur");
    });

  panzoomMap.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  panzoomActiveImage.setOptions({
    disableZoom: false,
    disablePan: false,
  });

  activeElementContainer.addEventListener(
    "wheel",
    panzoomActiveImage.zoomWithWheel
  );

  activeElementContainer.addEventListener("panzoomstart", () => {
    setTimeout(function () {
      activeElementContainer.style.pointerEvents = "none";
    }, 100);
  });

  activeElementContainer.addEventListener("panzoomend", () => {
    activeElementContainer.style.pointerEvents = "initial";
  });

  activeElementContainer.addEventListener("click", (event) => {
    setTimeout(function () {
      activeElementContainer.style.pointerEvents = "initial";
    }, 100);
  });

  activeElement = activeImageElement;

  activeElementContainer.addEventListener("wheel", function () {
    displayCurrentScale(panzoomActiveImage, 10);
    if (panzoomActiveImage.getScale() >= 10) {
      var nextElement = document.getElementById(
        parseFloat(activeElement.dataset.original) + 1
      );
      if (nextElement.tagName.toLowerCase() === "img") {
        var nextElementItem = items[parseFloat(nextElement.id)];
        panzoomActiveImage.reset();
        removeActiveElement();
        selectItem(nextElement, nextElementItem);
      } else {
        removeActiveElement();
      }
    } else if (panzoomActiveImage.getScale() <= 0.125) {
      var nextElement = document.getElementById(
        parseFloat(activeElement.dataset.original) - 1
      );
      if (nextElement.tagName.toLowerCase() === "img") {
        var nextElementItem = items[parseFloat(nextElement.id)];
        panzoomActiveImage.reset();
        removeActiveElement();
        selectItem(nextElement, nextElementItem);
      } else {
        removeActiveElement();
      }
    }
  });

  setActiveLongInfo(item);
}

/*<picture>
  <source srcset="img/awesomeWebPImage.webp" type="image/webp">
  <img src="img/creakyOldJPEG.jpg" alt="Alt Text!">
</picture>*/

function createActiveImageElementFromSelected(element, item) {
  var activeImageElement = createElement(
    "picture",
    {
      dataset: {
        original: element.id,
      },
      style: {
        left: element.style.left,
        top: element.style.top,
        transform: "translate(-50%, -50%)",
        opacity: 0,
      },
    },
    [
      createElement("source", {
        srcset: "images/" + item.image + ".webp",
        type: "image/webp",
      }),
      createElement("img", {
        src: "images/" + item.image + ".png",
        classList: ["centered"],
        onload() {
          this.style.transform = getWindowFitTransform(this);
          activeImageElement.style.opacity = 1;
          handleHighlighting(this, item);
        },
      }),
    ]
  );
  return activeImageElement;
}

function getWindowFitTransform(element, item) {
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

async function handleHighlighting(activeImageElement, item) {
  let currentSrcArray = activeImageElement.currentSrc.split(".");
  const srcExtension = currentSrcArray[currentSrcArray.length - 1];
  const src = "images/" + item.image + "_highlight." + srcExtension;

  var existingTimeout = null;

  var bounds = activeImageElement.getBoundingClientRect();
  var highlight = createElement("div", {
    id: "highlight-container",
    classList: ["highlight"],
    style: {
      position: "fixed",
      zIndex: 3,
      left: bounds.left + "px",
      top: bounds.top + "px",
    },
    onwheel() {
      document.getElementById("highlight-container").style.pointerEvents =
        "none";
      if (existingTimeout !== null) {
        clearTimeout(existingTimeout);
        existingTimeout = null;
      }

      existingTimeout = setTimeout(function () {
        document.getElementById("highlight-container").style.pointerEvents =
          "initial";
      }, 1000);
    },
  });
  activeElementContainer.appendChild(highlight);
  activeHighlight = highlight;

  const [highlightImage, Konva] = await Promise.all([
    loadImage(src),
    import(/* webpackChunkName: "konva" */ "konva"),
  ]);

  var hitArea = saveImageWithHitArea(Konva, highlightImage, {
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
  highlight.addEventListener("click", clearFootnote);
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

function removeCentered(element) {
  displayCurrentScale(panzoomMap, 5);

  var highlight = document.querySelector(".highlight");
  if (konvaStage) {
    konvaStage.destroy();
    konvaStage = null;
  }
  if (highlight) {
    highlight.parentNode.removeChild(highlight);
    activeHighlight = null;
  }

  element.style.transform = "translate(-50%,-50%) scale(0, 0)";

  setTimeout(function () {
    element.parentNode.removeChild(element);
    var original = document.getElementById(element.dataset.original);
    original.style.display = "block";
  }, ANIMATION_TIME);

  clearActiveLongInfo();

  document
    .querySelectorAll(".floating-element, .tag, .filters")
    .forEach(function (bgElement) {
      bgElement.classList.remove("blur");
    });

  panzoomActiveImage.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  panzoomActiveImage.reset();

  panzoomMap.setOptions({
    disableZoom: false,
    disablePan: false,
  });
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
  if (footnote) {
    footnote.parentElement.removeChild(footnote);
  }
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

  var fields = [
    item.location,
    item.dating,
    item.name,
    item.material,
    item.size,
  ];
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

function saveImageWithHitArea(Konva, image, container) {
  if (konvaStage) {
    konvaStage.destroy();
  }
  konvaStage = new Konva.Stage({
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
  konvaStage.add(layer);
  return area;
}

function checkIfIE() {
  if (window.document.documentMode) {
    document.body.classList.add("ie-fallback");
  }
}
