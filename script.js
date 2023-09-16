import { DateTime } from "./modules/luxon.js";

const dateAndTime = document.querySelector(".date-input");

// To display Time and Date
setInterval(() => {
  const now = DateTime.now();
  dateAndTime.innerHTML = now.toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS
  );
}, 1000);

const inputElement = document.getElementById("link-input");

inputElement.addEventListener("focus", myFunctionFocus);
inputElement.addEventListener("blur", myFunctionBlur);

function myFunctionFocus() {
  // Code to execute when the input gains focus
  console.log("Input gained focus");
  const submitButton = document.getElementById("join-btn");
  submitButton.classList.remove("inactive");
  submitButton.classList.add("active");
  submitButton.disabled = false;
}

function myFunctionBlur() {
  // Code to execute when the input loses focus
  console.log("Input lost focus");
  const submitButton = document.getElementById("join-btn");
  submitButton.classList.remove("active");
  submitButton.classList.add("inactive");
  submitButton.disabled = true;
}
