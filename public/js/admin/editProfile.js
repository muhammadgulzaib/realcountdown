
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
    document.querySelector("#submit-image").addEventListener("click", ()=>{
        
        Array.from(document.getElementById("textbox").children).forEach(image=>{
            if(image.className == "highlighted"){
                document.querySelector("#profile-pic").src = image.src
                document.querySelector("#imagePath").value = image.src

                document.querySelector("#close").click()
            }

        })
        
    })
    