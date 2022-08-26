
<?php
 include('includes/header.php');
 include('includes/navbar.php');

 ?>



<!-- Content Wrapper -->
<div id="content-wrapper" class="d-flex flex-column">

    <!-- Main Content -->
    <div id="content">

        <!-- Topbar -->
        <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

            <!-- Sidebar Toggle (Topbar) -->
            <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                        <i class="fa fa-bars"></i>
                    </button>

            <!-- Topbar Search -->
            <form class="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div class="input-group">
                    <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button">
                                    <i class="fas fa-search fa-sm"></i>
                                </button>
                    </div>
                </div>
            </form>

            <!-- Topbar Navbar -->
            <ul class="navbar-nav ml-auto">

                <!-- Nav Item - Search Dropdown (Visible Only XS) -->
                <li class="nav-item dropdown no-arrow d-sm-none">
                    <a class="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-search fa-fw"></i>
                    </a>
                    <!-- Dropdown - Messages -->
                    <div class="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
                        <form class="form-inline mr-auto w-100 navbar-search">
                            <div class="input-group">
                                <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2">
                                <div class="input-group-append">
                                    <button class="btn btn-primary" type="button">
                                                <i class="fas fa-search fa-sm"></i>
                                            </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </li>

                <!-- Nav Item - Alerts -->
                <li class="nav-item dropdown no-arrow mx-1">
                    <a class="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-bell fa-fw"></i>
                        <!-- Counter - Alerts -->
                        <span class="badge badge-danger badge-counter">3+</span>
                    </a>
                    <!-- Dropdown - Alerts -->
                    <div class="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                        <h6 class="dropdown-header">
                            Alerts Center
                        </h6>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="mr-3">
                                <div class="icon-circle bg-primary">
                                    <i class="fas fa-file-alt text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div class="small text-gray-500">December 12, 2019</div>
                                <span class="font-weight-bold">A new monthly report is ready to download!</span>
                            </div>
                        </a>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="mr-3">
                                <div class="icon-circle bg-success">
                                    <i class="fas fa-donate text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div class="small text-gray-500">December 7, 2019</div>
                                $290.29 has been deposited into your account!
                            </div>
                        </a>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="mr-3">
                                <div class="icon-circle bg-warning">
                                    <i class="fas fa-exclamation-triangle text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div class="small text-gray-500">December 2, 2019</div>
                                Spending Alert: We've noticed unusually high spending for your account.
                            </div>
                        </a>
                        <a class="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                    </div>
                </li>

                <!-- Nav Item - Messages -->
                <li class="nav-item dropdown no-arrow mx-1">
                    <a class="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-envelope fa-fw"></i>
                        <!-- Counter - Messages -->
                        <span class="badge badge-danger badge-counter">7</span>
                    </a>
                    <!-- Dropdown - Messages -->
                    <div class="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="messagesDropdown">
                        <h6 class="dropdown-header">
                            Message Center
                        </h6>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="dropdown-list-image mr-3">
                                <img class="rounded-circle" src="img/undraw_profile_1.svg" alt="...">
                                <div class="status-indicator bg-success"></div>
                            </div>
                            <div class="font-weight-bold">
                                <div class="text-truncate">Hi there! I am wondering if you can help me with a problem I've been having.</div>
                                <div class="small text-gray-500">Emily Fowler · 58m</div>
                            </div>
                        </a>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="dropdown-list-image mr-3">
                                <img class="rounded-circle" src="img/undraw_profile_2.svg" alt="...">
                                <div class="status-indicator"></div>
                            </div>
                            <div>
                                <div class="text-truncate">I have the photos that you ordered last month, how would you like them sent to you?</div>
                                <div class="small text-gray-500">Jae Chun · 1d</div>
                            </div>
                        </a>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="dropdown-list-image mr-3">
                                <img class="rounded-circle" src="img/undraw_profile_3.svg" alt="...">
                                <div class="status-indicator bg-warning"></div>
                            </div>
                            <div>
                                <div class="text-truncate">Last month's report looks great, I am very happy with the progress so far, keep up the good work!</div>
                                <div class="small text-gray-500">Morgan Alvarez · 2d</div>
                            </div>
                        </a>
                        <a class="dropdown-item d-flex align-items-center" href="#">
                            <div class="dropdown-list-image mr-3">
                                <img class="rounded-circle" src="https://source.unsplash.com/Mv9hjnEUHR4/60x60" alt="...">
                                <div class="status-indicator bg-success"></div>
                            </div>
                            <div>
                                <div class="text-truncate">Am I a good boy? The reason I ask is because someone told me that people say this to all dogs, even if they aren't good...</div>
                                <div class="small text-gray-500">Chicken the Dog · 2w</div>
                            </div>
                        </a>
                        <a class="dropdown-item text-center small text-gray-500" href="#">Read More Messages</a>
                    </div>
                </li>

                <div class="topbar-divider d-none d-sm-block"></div>

                <!-- Nav Item - User Information -->
                <li class="nav-item dropdown no-arrow">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="mr-2 d-none d-lg-inline text-gray-600 small">Douglas McGee</span>
                        <img class="img-profile rounded-circle" src="img/undraw_profile.svg">
                    </a>
                    <!-- Dropdown - User Information -->
                    <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                        <a class="dropdown-item" href="#">
                            <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i> Profile
                        </a>
                        <a class="dropdown-item" href="#">
                            <i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i> Settings
                        </a>
                        <a class="dropdown-item" href="#">
                            <i class="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i> Activity Log
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                            <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i> Logout
                        </a>
                    </div>
                </li>

            </ul>

        </nav>
        <!-- End of Topbar -->

        <!-- Begin Page Content -->
        <div  style="padding-left: 270px;" class="modal fade " id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div id="hide"  class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
    <div class="pt-4 text-center">
            <img style="width: 70px;" src="./images/LeaningCount.png" alt="">
        </div>
   <div>
   <h5 class="p-3" >
       <div >
Please enter Bid commession
            <input type="text"  class="form-control" id="bit" placeholder="Bid Commession" name="number">
    <br>            <div class="text-right"> <button onclick="myFunction(document.getElementById('bit').value)" type="button" class="btn btn-primary">
Ok
</button></div>
       </div>
</h5>
   </div>
    
    </div>
  </div>
</div>
        <div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="text-center">
                <h1>Buyer Countdown</h1> 
            </div>
        </div>
    </div>
</div>

<div class="container-fluid " style="background-color: cadetblue;">
   <div class="row">
      <div class="col-md-1"></div>
      <div class="col-md-4 m-2">
         <div class="input-group">
            <input type="text" class="form-control bg-light border-0 small" placeholder="Search for zip code" aria-label="Search" aria-describedby="basic-addon2">
            <div class="input-group-append">
               <button class="btn btn-primary" type="button">
               <i class="fas fa-search fa-sm"></i>
               </button>
            </div>
         </div>
      </div>
      <div class="col-md-3 m-2">
         <div class="input-group">
            <input type="text" class="form-control bg-light border-0 small" placeholder="Search by Sale Price" aria-label="Search" aria-describedby="basic-addon2">
            <div class="input-group-append">
               <button class="btn btn-primary" type="button">
               <i class="fas fa-search fa-sm"></i>
               </button>
            </div>
         </div>
      </div>
      
      <div class="col-md-3 m-2">
         <div class="input-group">
            <input type="text" class="form-control bg-light border-0 small" placeholder="Search for Commission" aria-label="Search" aria-describedby="basic-addon2">
            <div class="input-group-append">
               <button class="btn btn-primary" type="button">
               <i class="fas fa-search fa-sm"></i>
               </button>
            </div>
         </div>
      </div>
      <div class="col-md-3 m-2">
      <div id="map" style="width: 100%; height:50px"></div>
      </div>
      <div class="col-md-1"></div>
   </div>
</div>

<div class="container-fluid">
    <div class="row ">
    
<div class="col-md-2  ">
<h4>Card Tilte</h4>
<p>Wasif</p>
        </div>
        <div class="col-md-2 ">
<h4>Bid</h4>
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter">
 Commession Rate
</button>
        </div>
        <div class="col-md-2 ">
<h4>Zip Code</h4>
<p>42312</p>
        </div>
        <div class="col-md-4">
        <div class="card-body">
    <img class="card-img-top" style="width: 100px;" src="./images/Count_BatVersion.png" alt="Card image cap">
    <div class=" d-flex pt-2">
                  <div id="countdown" class="d-flex">
                     <div class="m-2">
                        <span id="days" style="background-color: black;padding: 4px; font-size: 20px;color: white; border-radius: 10px;"></span> 
                        <p class="pt-2 text-center text-danger">Days</p>
                     </div>
                     <div class="m-2">
                        <span id="hours" style="background-color: black;padding: 4px; font-size: 20px;color: white; border-radius: 10px;"></span>
                        <p class="pt-2 text-center text-danger">Hours</p>
                     </div>
                     <div class="m-2">
                        <span id="minutes" style="background-color: black;padding: 4px; font-size: 20px;color: white; border-radius: 10px;"></span>
                        <p class="pt-2 text-center text-danger">Min</p>
                     </div>
                     <div class="m-2">
                        <span id="seconds"style="background-color: black;padding: 4px; font-size: 20px;color: white; border-radius: 10px;"></span>
                        <p class="pt-2 text-center text-danger">Sec</p>
                     </div>
                  </div>
               </div>
    </div>
        </div>
        <div class="col-md-2 ">
<h4>Zip Code</h4>
<p>42312</p>
        </div>
        

    </div>
</div>
    <!-- End of Main Content -->

    <?php 
include('includes/footer.php');
?> 
<!-- End of Content Wrapper -->

</div>
<!-- End of Page Wrapper -->

<?php 
include('includes/scripts.php');
?>
<script>
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
      birthday = dayMonth + yyyy;
  
  today = mm + "/" + dd + "/" + yyyy;
  if (today > birthday) {
    birthday = dayMonth + nextYear;
  }
  //end
  
  const countDown = new Date(birthday).getTime(),
      x = setInterval(function() {    

        const now = new Date().getTime(),
              distance = countDown - now;

        document.getElementById("days").innerText = Math.floor(distance / (day)),
          document.getElementById("hours").innerText = Math.floor((distance % (day)) / (hour)),
          document.getElementById("minutes").innerText = Math.floor((distance % (hour)) / (minute)),
          document.getElementById("seconds").innerText = Math.floor((distance % (minute)) / second);

        //do something later when date is reached
        
        //seconds
      }, 0)
  }());
  function myFunction(bit) {
      
  
  document.getElementById("hide").style="display: none"
  document.getElementById("demo").innerHTML = bit;
  console.log("value check",bit)
}
$('#exampleModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var recipient = button.data('whatever') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-title').text('Add to your screen name and profile picture specificly for this BID ')
  modal.find('.modal-body input').val(recipient)
})
</script>



