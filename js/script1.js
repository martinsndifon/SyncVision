import { DateTime } from "../modules/luxon.js";

const dateAndTime = document.querySelector(".date-input");

// To display Time and Date
setInterval(() => {
  const now = DateTime.now();
  dateAndTime.innerHTML = now.toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS
  );
}, 1000);
