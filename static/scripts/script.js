const inputElement = document.getElementById("link-input");

inputElement.addEventListener("focus", myFunctionFocus);
inputElement.addEventListener("blur", myFunctionBlur);

function myFunctionFocus() {
  // Code to execute when the input gains focus
  const submitButton = document.getElementById("join-btn");
  submitButton.classList.remove("inactive");
  submitButton.classList.add("active");
  submitButton.disabled = false;
}

function myFunctionBlur() {
  // Code to execute when the input loses focus
  const submitButton = document.getElementById("join-btn");
  submitButton.classList.remove("active");
  submitButton.classList.add("inactive");
  submitButton.disabled = true;
}
