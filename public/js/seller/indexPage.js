function myFunction() {
  document.getElementById("myDIV2").style.display = "none";
  var x = document.getElementById("myDIV");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
  }
}

function myFunction2() {
  document.getElementById("myDIV").style.display = "none";
  var x = document.getElementById("myDIV2");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
  }
}

document.querySelector("#myTabContent").children[0].classList.add("show");
document.querySelector("#myTabContent").children[0].classList.add("active");

document.querySelector(".nav-pills li").children[0].classList.add("active");
