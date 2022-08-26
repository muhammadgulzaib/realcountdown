
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
<!-- Countdown by Zubair Azam -->
<!-- <style>
    .container {
  color: #333;
  margin: 0 auto;
  text-align: center;
    align-items: center;
  background-color: #ffd54f;
  display: flex;
  font-family: -apple-system, 
    BlinkMacSystemFont, 
    "Segoe UI", 
    Roboto, 
    Oxygen-Sans, 
    Ubuntu, 
    Cantarell, 
    "Helvetica Neue", 
    sans-serif;
}

h1 {
  font-weight: normal;
  letter-spacing: .125rem;
  text-transform: uppercase;
}

li {
  display: inline-block;
  font-size: 1.5em;
  list-style-type: none;
  padding: 1em;
  text-transform: uppercase;
}

li span {
  display: block;
  font-size: 4.5rem;
}

.emoji {
  display: none;
  padding: 1rem;
}

.emoji span {
  font-size: 4rem;
  padding: 0 .5rem;
}

@media all and (max-width: 768px) {
  h1 {
    font-size: calc(1.5rem * var(--smaller));
  }
  
  li {
    font-size: calc(1.125rem * var(--smaller));
  }
  
  li span {
    font-size: calc(3.375rem * var(--smaller));
  }
}
</style> -->

<div class="container-fluid">
<div class="row pt-2">
    <div class="col-md-12">
    <div class="text-center">
<div class="container">
  <!-- <div id="countdown">
    <ul>
      <li><span id="days" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span>days</li>
      <li><span id="hours" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span>Hours</li>
      <li><span id="minutes" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span>Minutes</li>
      <li><span id="seconds"style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span>Seconds</li>
    </ul>
  </div> -->
  <!-- <div id="content" class="emoji">
    <span>🥳</span>
    <span>🎉</span>
    <span>🎂</span>
  </div> -->
</div>
</div>
</div> </div>
</div>
        <!-- Begin Page Content -->
        <div class="container-fluid">
<div class="row pt-2">
    <div class="col-md-12">
    <div class="text-center">
                                <img style="width: 150px;" src="./images/BIDDER.png" alt="" />
                            </div>
                            <div class="text-center pt-3">
                                <img style="width: 150px" src="./images/Count_BatVersion.png" alt="" />
                            </div>
                            <div class=" d-flex justify-content-center pt-2">
                            <div id="countdown" class="d-flex">
      <!-- <div class="m-2">
                                    <span  style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px; " >00</span>
                                    <p class="pt-2 text-center">days</p>
                                </div> -->
                                <div class="m-2"> <span id="days" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span> <p class="pt-2 text-center">Days</p> </div>
                                <div class="m-2"> <span id="hours" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span><p class="pt-2 text-center">Hours</p></div>
                                <div class="m-2"><span id="minutes" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span><p class="pt-2 text-center">Minutes</p></div>
                                <div class="m-2"><span id="seconds"style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;"></span><p class="pt-2 text-center">Secounds</p></div>
   
  </div>
                                <!-- <div class="m-2">
                                    <span  style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px; " >00</span>
                                    <p class="pt-2 text-center">days</p>
                                </div>
                                <div class="m-2">
                                    <span style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">00</span>
                                    <p class="pt-2 text-center">hrs</p>
                                </div>
                                <div class="m-2">
                                    <span style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">00</span>
                                    <p class="pt-2 text-center">min</p>
                                </div>
                                <div class="m-2">
                                    <span style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">00</span>
                                    <p class="pt-2 text-center">sec</p>
                                </div> -->

                            </div>
                            <div class="container-fluid">
                                
    <div class="row">
        <div class="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4"></div>
        <div class="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4">
        <marquee behavior="" direction=""  scrollamount="10"  onmouseover="this.stop();"  onmouseout="this.start();">

<div class="m-2 d-flex" >

    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">12Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">24Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">36Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">48Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">60Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">72Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">84Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">96Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">108Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">120Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">132Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">144Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">156Hours</h3>
    <h3 class="m-2" style="background-color: black;padding: 8px; font-size: 20px;color: white; border-radius: 10px;">168Hours</h3>
</div>
</marquee>

</div>
<div class="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4"></div>

    </div>
</div>

        <div class="text-center pt-3">
            <p>countdown lenght 1 day to 1 week</p>
        </div>
        <div class="text-center">
          
<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter">
Start COUNTDOWN
</button>

<!-- Modal -->
<div style="padding-left: 270px;" class="modal fade " id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
    <div class="pt-4">
            <img style="width: 70px;" src="./images/LeaningCount.png" alt="">
        </div>
   <div>
   <h5 class="p-3">
    Coundown started successfully the bids of this property will be shown on dashboard under this property tab
</h5>
   </div>
    
    </div>
  </div>
</div>


            <!-- <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-example-modal-md">Start COUNTDOWN</button>

<div class="modal fade bd-example-modal-md"   tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm">
    <div class="modal-content">
        <div class="pt-4">
            <img style="width: 70px;" src="./images/LeaningCount.png" alt="">
        </div>
   <div>
   <p class="p-3">
    Coundown started successfully the bids of this property will be shown on dashboard under this property tab
    </p>
   </div>
    </div>
  </div>
</div> -->



        </div>
    </div>
</div>
</div>
                
        <!-- /.container-fluid -->

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
</script>



