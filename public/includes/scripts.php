<!-- Bootstrap core JavaScript-->

<script src="../js/request.js"></script>
<script src="vendor/jquery/jquery.min.js"></script>
<script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

<!-- Core plugin JavaScript-->
<script src="vendor/jquery-easing/jquery.easing.min.js"></script>

<!-- Custom scripts for all pages-->
<script src="js/sb-admin-2.min.js"></script>

<!-- Page level plugins -->
<script src="vendor/chart.js/Chart.min.js"></script>

<!-- Page level custom scripts -->
<script src="js/demo/chart-area-demo.js"></script>
<script src="js/demo/chart-pie-demo.js"></script>
<script src="https://kit.fontawesome.com/657d600cf9.js" crossorigin="anonymous"></script>

<script src="./js/request.js"></script>

<script src="./js/main.js"></script>

<script>
   document.querySelector("#btn").addEventListener("click", async () =>{
       fetch(`${requestUrl}/agent/logout`, {
           method:"GET"
       }).then(data=>{
        window.location.href = `${websiteUrlAgent}/login.html`;
       })
   })
</script>