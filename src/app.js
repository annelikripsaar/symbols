import Panzoom from "@panzoom/panzoom";
import { createElement } from "./utils";
import {
  aboutSection,
  toggleBackgroundBlur,
  colorButton,
  removeButtonColor,
} from "./about";

var activeElementContainer = document.getElementById("active-element");
export var activeElement;

var activeHighlight;
var container = document.getElementById("floating-elements");
var aboutButton = document.querySelector("[data-name='about']");
var footnoteContainer;
var konvaStage;
var timelineMode = false;
var museumMode = false;
let filteredItems = [];

window.addEventListener("mousemove", (e) => {
  if (footnoteContainer) {
    var x = e.clientX,
      y = e.clientY;
    footnoteContainer.style.top = y + 1 + "px";
    footnoteContainer.style.left = x + 1 + "px";
  }
});

var areas = {
  europe: {
    name: "Europe",
    x: [0.28, 0.55],
    y: [0.09, 0.55],
  },
  asia: {
    name: "Asia",
    x: [0.67, 0.96],
    y: [0.12, 0.88],
  },
  africa: {
    name: "Africa",
    x: [0.33, 0.55],
    y: [0.73, 0.85],
  },
  southamerica: {
    name: "South America",
    x: [0.04, 0.2],
    y: [0.71, 0.9],
  },
  northamerica: {
    name: "North America",
    x: [0.02, 0.2],
    y: [0.15, 0.35],
  },
  centralamerica: {
    name: "Central America",
    x: [0.06, 0.2],
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
var LEFT_KEYCODE = 37;
var RIGHT_KEYCODE = 39;
var ANIMATION_TIME = 200;

export function run(items) {
  checkIfIE();

  initActiveElementRemoval();
  addItemsToAreas(items, areas);

  initPanZoom();

  initKeyboardNavigation(items);

  initFilters(items);

  document.getElementById("timeline-button").onclick = () => {
    timelineMode = !timelineMode;
    if (timelineMode) {
      document.getElementById("museum-button").style.display = "none";
      if (museumMode) {
        museumMode = !museumMode;
        document.getElementById("museum-button").textContent =
          "Current location";
      }
      document.getElementById("button-separator").style.display = "none";
      document.querySelectorAll(".floating-element").forEach((element) => {
        element.style.opacity = "0";
      });
      document.getElementById("timeline-button").textContent = "Map";
      setTimeout(() => positionElementsByAge(), ANIMATION_TIME * 2);
    } else {
      document.getElementById("museum-button").style.display = "inline";
      document.getElementById("button-separator").style.display = "inline";
      panzoomMap.setOptions({
        disableZoom: false,
        disablePan: false,
      });
      document.querySelectorAll(".floating-element").forEach((element) => {
        element.style.opacity = "0";
      });
      document.getElementById("timeline-button").textContent = "Timeline";
      setTimeout(() => {
        container.classList.remove("timeline-layout");
        initializeItems(items);
      }, ANIMATION_TIME);
    }
  };

  document.getElementById("museum-button").onclick = () => {
    museumMode = !museumMode;
    if (museumMode) {
      document.querySelectorAll(".tag").forEach((tag) => {
        tag.parentElement.removeChild(tag);
      });
      document.getElementById("museum-button").textContent =
        "Original location";
      setTimeout(() => {
        positionElementsByMuseum(items, filteredItems);
      }, ANIMATION_TIME * 2);
    } else {
      panzoomMap.setOptions({
        disableZoom: false,
        disablePan: false,
      });

      document.getElementById("museum-button").textContent = "Current location";
      setTimeout(() => {
        document.querySelectorAll(".floating-element").forEach((element) => {
          positionElementByGroup(element, items[parseFloat(element.id)]);
        });
      }, ANIMATION_TIME);

      document.querySelectorAll(".museum-tag").forEach((tag) => {
        tag.parentElement.removeChild(tag);
      });

      if (filteredItems.length) {
        addItemsToAreas(filteredItems, areas);
      } else {
        addItemsToAreas(items, areas);
      }
    }
  };

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      initializeItems(items);
    });
    resizeObserver.observe(document.body);
  } else {
    initializeItems(items);
    toggleBackgroundBlur();
  }
}

function initializeItems(items) {
  clearAreas();
  clearAllItems();
  addItemsToAreas(items, areas);
  items.forEach((item) => createItem(item, items));

  const scaleContainer = document.querySelector(".scale-container");
  scaleContainer.style.display = "flex";

  if (aboutSection.style.display === "block" || activeElement) {
    document
      .querySelectorAll(
        ".floating-element, .tag, .filters, .scale-container, .buttons"
      )
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

function initFilters(items) {
  var filters = document.querySelectorAll(".filter, .large-filter");
  filters.forEach(function (filter) {
    filter.onclick = function () {
      filter.blur();
      clearAreas();
      if (filter.classList.contains("active-filter")) {
        filter.classList.remove("active-filter");
        filteredItems = [];
        if (!museumMode) {
          addItemsToAreas(items, areas);
          document.querySelectorAll(".floating-element").forEach((element) => {
            element.style.opacity = "1";
            element.style.pointerEvents = "initial";
          });
        } else {
          document.querySelectorAll(".museum-tag").forEach((tag) => {
            tag.parentElement.removeChild(tag);
          });
          createMuseumTags(items);
          document.querySelectorAll(".floating-element").forEach((element) => {
            element.style.opacity = "1";
            element.style.pointerEvents = "initial";
          });
        }
      } else {
        resetAllFilters(filters);
        document
          .querySelectorAll("[data-name=" + filter.dataset.name + "]")
          .forEach((filter) => {
            filter.classList.add("active-filter");
          });

        filteredItems = items.filter(function (item) {
          var tags = item.tags.replace(" ", "").split(",");
          return tags.includes(filter.dataset.name);
        });

        if (!museumMode) {
          addItemsToAreas(filteredItems, areas);
          document.querySelectorAll(".floating-element").forEach((element) => {
            element.style.opacity = "1";
            element.style.pointerEvents = "initial";
          });
          document.querySelectorAll(".floating-element").forEach((element) => {
            let item = items[parseFloat(element.id)];
            let tags = item.tags.replace(" ", "").split(",");
            if (!tags.includes(filter.dataset.name)) {
              element.style.opacity = "0";
              element.style.pointerEvents = "none";
            }
          });
        } else {
          document.querySelectorAll(".museum-tag").forEach((tag) => {
            tag.parentElement.removeChild(tag);
          });
          createMuseumTags(filteredItems);
          document.querySelectorAll(".floating-element").forEach((element) => {
            element.style.opacity = "1";
            element.style.pointerEvents = "initial";
          });
          document.querySelectorAll(".floating-element").forEach((element) => {
            let item = items[parseFloat(element.id)];
            let tags = item.tags.replace(" ", "").split(",");
            if (!tags.includes(filter.dataset.name)) {
              element.style.opacity = "0";
              element.style.pointerEvents = "none";
            }
          });
        }

        if (aboutSection.style.display === "block") {
          document
            .querySelectorAll(".showcase-item")
            .forEach((showcaseItem) => {
              showcaseItem.parentNode.removeChild(showcaseItem);
            });

          aboutButton.classList.remove("close-button");
          aboutButton.textContent = "Tracing Ties";
          aboutButton.onmouseenter = () => colorButton();
          aboutButton.onmouseleave = () => removeButtonColor();
          toggleBackgroundBlur();
          aboutSection.style.display = "none";
        }
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

  container.addEventListener("touchstart", () => {
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

export function removeActiveElement() {
  if (activeElement) {
    aboutButton.classList.remove("close-button");
    aboutButton.textContent = "Tracing Ties";
    activeElement.style.opacity = "0";
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
  scaleContainer.textContent = "Detail: " + currentScale;
}

function displayActiveElementScale(zoomContainer, activeElement, item) {
  const itemActualSize = item.width * 100;
  const imageWidth = activeElement
    .querySelector(".centered")
    .getBoundingClientRect().width;
  const devicePPCM = (window.devicePixelRatio * 96) / 2.54;
  const imageActualSize = imageWidth / devicePPCM;

  const scale =
    (imageActualSize / itemActualSize) * zoomContainer.getScale() * 100;
  var currentScale = "~" + Math.floor(scale) + "%";
  var scaleContainer = document.getElementById("scale");
  scaleContainer.textContent = "Scale: " + currentScale;
}

function initKeyboardNavigation(items) {
  window.addEventListener("keydown", function () {
    if (activeElement) {
      if (this.event.keyCode == LEFT_KEYCODE) {
        displayPreviousItem(items);
      }
      if (this.event.keyCode == RIGHT_KEYCODE) {
        displayNextItem(items);
      }
    }
  });
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
      transform: "translateY(-225%)",
    },
  });
  container.appendChild(areaTag);
}

function createItem(item, items) {
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
        selectItem(element, item, items);
        setTimeout(() => {
          container.style.pointerEvents = "initial";
        }, 101);
      },
    },
    [
      createElement("source", {
        srcset: "thumbnails/" + item.image + ".webp",
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

  element.style.opacity = "0";
  element.querySelector("img").onload = function () {
    positionElementByGroup(element, item, container);
    element.style.opacity = "1";
    if (activeElement || aboutSection.style.display === "block") {
      element.classList.add("blur");
    }
  };
}

function positionElementByGroup(element, item) {
  element.classList.add("floating-element");

  if (item.group) {
    Object.values(areas).forEach(function (area) {
      if (item.group === area.name) {
        positionInGroup(element, area, container, item);
      }
    });
  } else {
    element.style.display = "none";
  }
}

function positionInGroup(element, area, container, item) {
  element.style.left =
    getRelativePositionInContainerXRange(area.x, container, item) + "px";
  element.style.top =
    getRelativePositionInContainerYRange(area.y, container, item) + "px";
}

function getRelativePositionInContainerXRange(range, container, item) {
  var relativePosition = range[0] + item.xpos * (range[1] - range[0]);
  return relativePosition * container.offsetWidth;
}

function getRelativePositionInContainerYRange(range, container, item) {
  var relativePosition = range[0] + item.ypos * (range[1] - range[0]);
  return relativePosition * container.offsetHeight;
}

function positionElementsByAge() {
  container.classList.add("timeline-layout");
  panzoomMap.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  var tags = document.querySelectorAll(".tag");
  tags.forEach(function (tag) {
    tag.parentNode.removeChild(tag);
  });

  const scaleContainer = document.querySelector(".scale-container");
  scaleContainer.style.display = "none";

  var elements = document.querySelectorAll(".floating-element");
  elements.forEach((element, index) => {
    createTimeTags(element, index);
    element.style.position = "static";
    element.style.opacity = "1";
    element.querySelector("img").style.width =
      parseFloat(element.querySelector("img").style.width.slice(0, -1)) * 2 +
      "px";
    element.classList.add("timeline-element");
  });

  document
    .querySelector(".timeline-layout")
    .addEventListener("wheel", scrollHorizontally);
}

function createTimeTags(element, id) {
  if (id === 0) {
    element.dataset.content = "1900 B.C.";
  } else if (id === 3) {
    element.dataset.content = "750 B.C.";
  } else if (id === 5) {
    element.dataset.content = "200";
  } else if (id === 8) {
    element.dataset.content = "500";
  } else if (id === 11) {
    element.dataset.content = "600";
  } else if (id === 14) {
    element.dataset.content = "700";
  } else if (id === 15) {
    element.dataset.content = "800";
  } else if (id === 17) {
    element.dataset.content = "1100";
  } else if (id === 21) {
    element.dataset.content = "1200";
  } else if (id === 24) {
    element.dataset.content = "1300";
  } else if (id === 29) {
    element.dataset.content = "1400";
  } else if (id === 32) {
    element.dataset.content = "1500";
  } else if (id === 36) {
    element.dataset.content = "1600";
  } else if (id === 38) {
    element.dataset.content = "1700";
  } else if (id === 42) {
    element.dataset.content = "1800";
  } else if (id === 58) {
    element.dataset.content = "1820";
  } else if (id === 63) {
    element.dataset.content = "1850";
  } else if (id === 67) {
    element.dataset.content = "1900";
  }
}

function positionElementsByMuseum(items, filteredItems) {
  var elements = document.querySelectorAll(".floating-element");
  elements.forEach((element) => {
    let item = items[parseFloat(element.id)];
    if (item.credit === "The Met") {
      element.style.left = "7vw";
      element.style.top = "40vh";
    } else if (item.credit === "Victoria & Albert Museum") {
      element.style.left = "35vw";
      element.style.top = "40vh";
    } else if (item.credit === "Estonian National Museum") {
      element.style.left = "50vw";
      element.style.top = "15vh";
    } else if (item.credit === "Textile Museum of Canada") {
      element.style.left = "17vw";
      element.style.top = "13vh";
    } else if (item.credit === "Saatse Seto Museum") {
      element.style.left = "55vw";
      element.style.top = "34vh";
    } else if (item.credit === "The State Hermitage Museum") {
      element.style.left = "65vw";
      element.style.top = "15vh";
    } else if (item.credit === "The David Collection") {
      element.style.left = "35vw";
      element.style.top = "9vh";
    } else if (item.credit === "American Folk Art Museum") {
      element.style.left = "3vw";
      element.style.top = "19vh";
    }
  });

  if (filteredItems.length) {
    createMuseumTags(filteredItems);
  } else {
    createMuseumTags(items);
  }
}

function createMuseumTags(items) {
  let museumTags = [
    {
      name: "The Met",
      left: "7vw",
      top: "35vh",
    },
    {
      name: "Victoria & Albert Museum",
      left: "35vw",
      top: "36vh",
    },
    {
      name: "Estonian National Museum",
      left: "50vw",
      top: "10vh",
    },
    {
      name: "Textile Museum of Canada",
      left: "17vw",
      top: "8vh",
    },
    {
      name: "Saatse Seto Museum",
      left: "55vw",
      top: "30vh",
    },
    {
      name: "The State Hermitage Museum",
      left: "65vw",
      top: "10vh",
    },
    {
      name: "The David Collection",
      left: "35vw",
      top: "5vh",
    },
    {
      name: "American Folk Art Museum",
      left: "3vw",
      top: "15vh",
    },
  ];

  countMuseumItems(items, museumTags);

  museumTags.forEach((tag) => {
    const tagElement = createElement("p", {
      textContent: tag.name + ": " + tag.count,
      classList: ["museum-tag"],
      style: {
        left: tag.left,
        top: tag.top,
      },
    });
    document.getElementById("floating-elements").appendChild(tagElement);
  });
}

function countMuseumItems(items, museums) {
  museums.forEach((museum) => {
    let museumItems = items.filter((item) => item.credit === museum.name);
    museum.count = museumItems.length;
  });
}

function scrollHorizontally(e) {
  e = window.event || e;
  if (e.wheelDelta) {
    var delta = Math.max(-1, Math.min(1, e.wheelDelta));
  } else {
    var delta = Math.max(-1, Math.min(1, -e.deltaY));
  }
  document.querySelector(".timeline-layout").scrollLeft -= delta * 40;
  e.preventDefault();
}

function selectItem(element, item, items) {
  element.style.display = "none";

  const scaleContainer = document.querySelector(".scale-container");
  scaleContainer.style.display = "flex";

  aboutButton.classList.add("close-button");
  aboutButton.textContent = "×";
  aboutButton.onmouseenter = () => removeButtonColor();

  var activeImageElement = createActiveImageElementFromSelected(element, item);
  activeElementContainer.style.display = "block";
  activeElementContainer.appendChild(activeImageElement);

  setTimeout(() => {
    displayActiveElementScale(panzoomActiveImage, activeImageElement, item);
  }, 1000);

  activeElementContainer.addEventListener("wheel", function () {
    changeScaleOnScroll(activeImageElement, item);
  });

  document
    .querySelectorAll(".floating-element, .tag, .filters, .buttons")
    .forEach(function (bgElement) {
      bgElement.classList.add("blur");
    });

  panzoomMap.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  panzoomActiveImage.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  setTimeout(() => {
    panzoomActiveImage.setOptions({
      disableZoom: false,
      disablePan: false,
    });
  }, 1000);

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

  activeElementContainer.addEventListener("touchstart", (event) => {
    setTimeout(function () {
      activeElementContainer.style.pointerEvents = "initial";
    }, 100);
  });

  activeElement = activeImageElement;

  setActiveLongInfo(item);
}

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
        src: "thumbnails/" + item.image + ".png",
        classList: ["centered"],
        onload() {
          this.style.transform = getWindowFitTransform(this);
          activeImageElement.style.opacity = 1;
          setTimeout(() => handleHighlighting(this, item), 1000);
        },
      }),
    ]
  );
  return activeImageElement;
}

function getWindowFitTransform(element) {
  var heightRatio = window.innerHeight / element.offsetHeight;
  var widthRatio = window.innerWidth / element.offsetWidth;
  var heightPadding = 1;
  var widthPadding = 2;

  if (heightRatio < widthRatio) {
    return (
      "translate(-50%, -50%) scale(" +
      (heightRatio - heightPadding) +
      ", " +
      (heightRatio - heightPadding) +
      ")"
    );
  } else {
    return (
      "translate(-50%, -50%) scale(" +
      (widthRatio - widthPadding) +
      ", " +
      (widthRatio - widthPadding) +
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
      }, 5000);
    },
  });
  if (!document.querySelector(".highlight")) {
    activeElementContainer.appendChild(highlight);
  }
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
    createFootnote(item);
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
  clearFootnote();

  document
    .querySelectorAll(".floating-element, .tag, .filters, .buttons")
    .forEach(function (bgElement) {
      bgElement.classList.remove("blur");
    });

  panzoomActiveImage.setOptions({
    disableZoom: true,
    disablePan: true,
  });

  panzoomActiveImage.reset();

  if (!timelineMode) {
    panzoomMap.setOptions({
      disableZoom: false,
      disablePan: false,
    });
  } else {
    const scaleContainer = document.querySelector(".scale-container");
    scaleContainer.style.display = "none";
  }
}

function createFootnote(item) {
  var footnote = createElement(
    "div",
    {
      id: "footnote",
      classList: ["footnote-container"],
      style: {},
    },
    [
      createElement(
        "p",
        {
          classList: ["footnote"],
        },
        [
          createElement("span", {
            classList: ["footnote-text"],
            textContent: item.footnote,
          }),
        ]
      ),
    ]
  );
  activeElementContainer.appendChild(footnote);
  footnoteContainer = footnote;
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

function changeScaleOnScroll(activeElement, item) {
  displayActiveElementScale(panzoomActiveImage, activeElement, item);
  /*if (panzoomActiveImage.getScale() >= 10) {
    displayNextItem(items);
    setTimeout(() => {
      panzoomActiveImage.setOptions({
        disableZoom: false,
        disablePan: false,
      });
    }, 1000);
  } else if (panzoomActiveImage.getScale() <= 0.125) {
    displayPreviousItem(items);
    setTimeout(() => {
      panzoomActiveImage.setOptions({
        disableZoom: false,
        disablePan: false,
      });
    }, 1000);*/
}

function displayNextItem(items) {
  clearFootnote();
  var nextElement = document.getElementById(
    parseFloat(activeElement.dataset.original) + 1
  );

  panzoomActiveImage.reset();
  removeActiveElement();
  if (nextElement) {
    var nextElementItem = items[parseFloat(nextElement.id)];
  } else {
    nextElement = document.getElementById("0");
    var nextElementItem = items[0];
  }

  selectItem(nextElement, nextElementItem, items);
  panzoomActiveImage.setOptions({
    disableZoom: true,
    disablePan: true,
  });
}

function displayPreviousItem(items) {
  clearFootnote();
  var nextElement = document.getElementById(
    parseFloat(activeElement.dataset.original) - 1
  );
  panzoomActiveImage.reset();
  removeActiveElement();

  if (nextElement) {
    var nextElementItem = items[parseFloat(nextElement.id)];
  } else {
    nextElement = document.getElementById((items.length - 1).toString());
    console.log(nextElement);
    var nextElementItem = items[items.length - 1];
  }
  selectItem(nextElement, nextElementItem, items);
  panzoomActiveImage.setOptions({
    disableZoom: true,
    disablePan: true,
  });
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
