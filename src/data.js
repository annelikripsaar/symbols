import Papa from "papaparse";
import csv from "../data.csv";

const data = Papa.parse(csv, { header: true }).data;
data.sort(
  (a, b) => parseFloat(a["Sorting year"]) - parseFloat(b["Sorting year"])
);
export default data.map(function (value, index) {
  return {
    id: index,
    name: value.Name,
    tags: value.Tags,
    footnote: value.Footnote || null,
    location: value.Location || null,
    group: value.Group,
    xpos: parseFloat(value["X position"]) || null,
    ypos: parseFloat(value["Y position"]) || null,
    dating: value.Dating || null,
    material: value.Material || null,
    size: value.Size || null,
    width: parseFloat(value["Display width"]) || null,
    credit: value.Credit,
    link: value.Link,
    image: value.File || null,
  };
});
