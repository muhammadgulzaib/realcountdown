const input = document.querySelector("#focus");

input.addEventListener("keyup", function (e) {
  const val = e.target.value;
  if (parseInt(val) < 0 || parseInt(val) > 3) {
    document.querySelector("#error").textContent =
      "Commission must be lower than 3 and greater than or equal to 0, commision will default to 3 if value is greater!";
  } else {
    document.querySelector("#error").textContent = "";
  }
});
