import { DateTime } from "./modules/luxon.js";
import toggleButton from "./modules/volumeToogle.js";
import toggleButtonCam from "./modules/cameraToogle.js";

const dateAndTime = document.querySelector(".date-input");

// To display Time and Date
setInterval(() => {
  const now = DateTime.now();
  dateAndTime.innerHTML = now.toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS
  );
}, 1000);

toggleButtonCam();
toggleButton();
