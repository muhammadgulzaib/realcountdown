//  document.getElementById("myDIV").style.display="none";

function myFunction() {
  document.getElementById("myDIV2").style.display = "none";
  var x = document.getElementById("myDIV");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function Accepted() {
  document.write("Accepted bid");
}

function Rejected() {
  document.write("Rejected bid");
}

function Waiting() {
  document.write("Waiting bid");
}
function countdown() {
  setInterval(() => {
    let day = document.querySelector("#days");
    let hour = document.querySelector("#hours");
    let minute = document.querySelector("#minutes");
    let second = document.querySelector("#seconds");

    if (
      parseInt(day.textContent) > 0 ||
      parseInt(hour.textContent) > 0 ||
      parseInt(minute.textContent) > 0 ||
      parseInt(second.textContent) > 0
    ) {

      second.textContent -= 1;
      if (second.textContent == 0) {
        minute.textContent -= 1;
        second.textContent = 60;
      }
      if (minute.textContent == 0) {
        hour.textContent -= 1;
        minute.textContent = 59;
      }
      if (hour.textContent == 0) {
        day.textContent -= 1;
        hour.textContent = 24;
      }


    }
  }, 1000);
}

window.addEventListener("load", countdown);
