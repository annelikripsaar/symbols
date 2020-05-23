let specialProperties = new Set([
  "classList",
  "dataset",
  "style",
  "onload",
  "onclick",
  "onmouseenter",
  "onmouseleave",
  "onwheel",
]);

export function createElement(tag, properties = {}, children = []) {
  var element = document.createElement(tag);
  Object.entries(properties)
    .filter(([key]) => !specialProperties.has(key))
    .forEach(([key, value]) => {
      element[key] = value;
    });
  if (properties.classList) {
    properties.classList.forEach(function (c) {
      element.classList.add(c);
    });
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
  children.forEach((child) => element.appendChild(child));
  return element;
}
