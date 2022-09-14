const { format } = require("date-fns");
const d = "2021-09-08";
const xx = new Date("1-2-98");
try {
  const formatDate = format(xx, "yyyy-MM-dd");
  console.log(formatDate);
} catch (e) {
  console.log("Invalid Date");
}
