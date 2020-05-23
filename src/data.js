import Papa from "papaparse";
import csv from "../data.csv";

export default Papa.parse(csv, { header: true }).data.map(function (
  value,
  index
) {
  return {
    id: index,
    name: value.Name,
    tags: value.Tags,
    footnote: value.Footnote || null,
    location: value.Location || null,
    group: value.Group,
    dating: value.Dating || null,
    material: value.Material || null,
    size: value.Size || null,
    width: parseFloat(value["Display width"]) || null,
    credit: value.Credit,
    link: value.Link,
    image: value.File || null,
  };
});
