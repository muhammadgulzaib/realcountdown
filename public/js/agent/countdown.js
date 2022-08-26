


(function () {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

  //I'm adding this section so I don't have to keep updating this pen every year :-)
  //remove this if you don't need it
  let today = new Date(),
    dd = String(today.getDate()).padStart(0, "0"),
    mm = String(today.getMonth() + 0).padStart(0, "0"),
    yyyy = today.getFullYear(),
    nextYear = yyyy + 1,
    dayMonth = "01/01/",
    birthday = new Date(document.querySelector("#date").value);

  today = mm + "/" + dd + "/" + yyyy;
  if (today > birthday) {
    birthday = dayMonth + nextYear;
  }
  //end

  const countDown = new Date(birthday).getTime(),
    x = setInterval(function () {
      const now = new Date().getTime(),
        distance = countDown - now;

      (document.getElementById("days").innerText = Math.floor(distance / day)),
        (document.getElementById("hours").innerText = Math.floor(
          (distance % day) / hour
        )),
        (document.getElementById("minutes").innerText = Math.floor(
          (distance % hour) / minute
        )),
        (document.getElementById("seconds").innerText = Math.floor(
          (distance % minute) / second
        ));

      //do something later when date is reached

      //seconds
    }, 0);
})();
function myFunction(bit) {
  document.getElementById("hide").style = "display: none";
  document.getElementById("demo").innerHTML = bit;
  console.log("value check", bit);
}
$("#exampleModal").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var recipient = button.data("whatever"); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal
    .find(".modal-title")
    .text(
      "Add to your screen name and profile picture specificly for this BID "
    );
  modal.find(".modal-body input").val(recipient);
});



// document.querySelector("#bid-button").addEventListener("click", ()=>{

// })
// myFunction(document.getElementById('bit').value)


var ImageSelector = function() {
  var imgs = null;
  var selImg = null;
  return {
    addImages: function(container) {
      imgs = container.getElementsByTagName("img");
      for (var i = 0, len = imgs.length; i < len; i++) {
        var img = imgs[i];
        img.className = "normal";
        img.nextSibling.className = "normal";
        img.onclick = function() {
          if (selImg) {
            selImg.className = "normal";
            selImg.nextSibling.className = "normal";
          }
          this.className = "highlighted";
          this.nextSibling.className = "highlighted";
          selImg = this;
        };
      }
    }
  };
  }();
  var div = document.getElementById("textbox");
  ImageSelector.addImages(div);

  // document.querySelector("#commision").addEventListener("keyup", function(e){
  //     if(parseInt(e.target.value) < 0 || parseInt(e.target.value) > 3 ){
  //         document.querySelector("#error-commission").textContent = "Commission must be less than 3 and greater than 0";
  //         document.querySelector("#btn").disabled = true
  //     }
  //     else{
  //         document.querySelector("#error-commission").textContent = "";
  //         document.querySelector("#btn").disabled = false
  //     }
  // })
  // document.querySelector("#phone").addEventListener("keyup", function(e){
  //     if(e.target.value.length < 8 || e.target.value.length > 12 ){
  //         document.querySelector("#error-phone").textContent = "Phone number must be greater than 8 digits and less than 12 digits";
  //         document.querySelector("#btn").disabled = true
  //     }
  //     else{
  //         document.querySelector("#error-phone").textContent = "";
  //         document.querySelector("#btn").disabled = false
  //     }
  // })

  const images = Array.from(document.querySelector("#textbox").children)
images.forEach(image => {

  image.addEventListener('click', ()=>{
    document.querySelector("#image-profile").src = image.src
    document.querySelector("#image-src").value = image.src
  })
})

function closeImage(e){
  document.querySelector("#hide-image")
  //document.querySelector("#hide-image").style.paddingLeft = 270+'px';
}

// document.querySelector("#close-image").addEventListener('click', closeImage)