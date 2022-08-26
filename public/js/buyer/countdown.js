function countdown() {
  setInterval(() => {
    let day = document.querySelector("#day");
    let hour = document.querySelector("#hour");
    let minute = document.querySelector("#minute");
    let second = document.querySelector("#second");

    console.log(day.textContent > 0);
    if (
      parseInt(day.textContent) > 0 ||
      parseInt(hour.textContent) > 0 ||
      parseInt(minute.textContent) > 0 ||
      parseInt(second.textContent) > 0
    ) {
      console.log("Hwell");
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

      console.log(
        day.textContent,
        hour.textContent,
        minute.textContent,
        second.textContent
      );
    }
  }, 1000);
}

window.addEventListener("load", countdown);
