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

    document?.querySelector("#commision")?.addEventListener("keyup", function(e){
        if(parseInt(e.target.value) < 0 || parseInt(e.target.value) > 3 ){
            document.querySelector("#error-commission").textContent = "Commission must be less than 3 and greater than 0";
            document.querySelector("#btn").disabled = true
        }
        else{
            document.querySelector("#error-commission").textContent = "";
            document.querySelector("#btn").disabled = false
        }
    })
    document?.querySelector("#phone")?.addEventListener("keyup", function(e){
        if(e.target.value.length < 8 || e.target.value.length > 12 ){
            document.querySelector("#error-phone").textContent = "Phone number must be greater than 8 digits and less than 12 digits";
            document.querySelector("#btn").disabled = true
        }
        else{
            document.querySelector("#error-phone").textContent = "";
            document.querySelector("#btn").disabled = false
        }
    })
    // document.querySelector("#image").addEventListener("click", my)
    // onclick="myFunction(document.getElementById('bit').value)"

    var div = document.getElementById("textbox");
    ImageSelector.addImages(div);


    document.querySelector("#btn-profile")?.addEventListener("click", ()=>{
        Array.from(document.getElementById("textbox").children).forEach(image => {
          if(image.className === "highlighted")
          {
            console.log(`J`)
              document.querySelector("#img-profile").src = image.src
              document.querySelector("#image-text").value = image.src;
          }
          document.querySelector("#close").click();
        })
    })