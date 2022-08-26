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
