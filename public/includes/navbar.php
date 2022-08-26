

<!-- Sidebar -->
<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

    <!-- Sidebar - Brand -->
    <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.php">
        <div class="sidebar-brand-icon rotate-n-15">
            <i class="fas fa-laugh-wink"></i>
        </div>
        <div class="sidebar-brand-text mx-3">Agent</div>
    </a>

    <!-- Divider -->
    <hr class="sidebar-divider my-0">

    <!-- Nav Item - Dashboard -->
    <li class="nav-item active">
        <a class="nav-link" href="index.php">
            <i class="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span> 
    </li>

    <!-- Divider -->
    <hr class="sidebar-divider">

    <!-- Heading -->
    <div class="sidebar-heading">
        Interface
    </div>

    

    <!-- Nav Item - Pages Collapse Menu -->

    
    <li class="nav-item">
                <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseReq" aria-expanded="true" aria-controls="collapseTwo">
                <i class="fas fa-fw fa-folder"></i>
                    <span>Countdown Room </span>
                </a>
                <div id="collapseReq" class="collapse " aria-labelledby="headingTwo" data-parent="#accordionSidebar">
                    <div class="bg-white py-2 collapse-inner rounded">
                      
                        <a class="collapse-item" href="CDpayment.php">Seller Countdown</a>
                        <a class="collapse-item" href="CDpay.php">Buyer Countdown</a>
                        <a class="collapse-item" href="mycountdown.php">My Countdown</a>
                      

                    </div>
                </div>
            </li>





    <li class="nav-item">
                <a class="nav-link collapsed" href="bids-progress.php" data-toggle="collapse" data-target="#collapseUtilities"
                    aria-expanded="true" aria-controls="collapseUtilities">
                    <i class="fas fa-fw fa-folder"></i>
                    <span>Bids In Progress</span>
                </a>
                <div id="collapseUtilities" class="collapse" aria-labelledby="headingUtilities"
                    data-parent="#accordionSidebar">
                    <div class="bg-white py-2 collapse-inner rounded">
                        <a class="collapse-item" href="accepted-bids.php">Accepted Bids</a>
                        <a class="collapse-item" href="rejected-bids.php">Rejected Bids</a>
                        <a class="collapse-item" href="waiting-bids.php">Waiting Bids</a>

                    </div>
                </div>
            </li>



  

   

  

    
    <!-- <li class="nav-item">
        <a class="nav-link" href="add-property.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Add Property</span></a>
    </li> -->


    <!-- <li class="nav-item">
        <a class="nav-link" href="bids-progress.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Bids In Progress </span></a>
            
    </li> -->

  

   

    <li class="nav-item">
        <a class="nav-link" href="successful-bids.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Successful Bids </span></a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="map.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Map View </span></a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="ProMessages.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Promotional Messages  <i class="fas pl-3 fa-envelope fa-fw"></i></span>
            <span class="badge badge-danger badge-counter">2</span>
        
        </a>
    </li>
     <!-- <li class="nav-item">
        <a class="nav-link" href="ProMsg.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Promotional Messages <i class="fas pl-3 fa-envelope fa-fw"></i></span>
            <span class="badge badge-danger badge-counter">2</span>
        </a>
    </li> -->

    <li class="nav-item">
        <a class="nav-link" href="refferal-agreement.php">
            <i class="fas fa-fw fa-chart-area"></i>
            <span>Referral Agreement </span></a>
    </li>


    <li class="nav-item">
        <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseProfileAgent" aria-expanded="true" aria-controls="collapsePages">
            <i class="fas fa-fw fa-folder"></i>
            <span> Chat</span>
        </a>
        <div id="collapseProfileAgent" class="collapse " aria-labelledby="headingPages" data-parent="#accordionSidebar">
            <div class="bg-white py-2 collapse-inner rounded">

                <a class="collapse-item" href="adminchat.php">Admin</a>
                <a class="collapse-item" href="sellerchat.php">Seller</a>
                <a class="collapse-item" href="buyerchat.php">Buyer</a>
               

            </div>
        </div>
    </li>

    <!-- <li class="nav-item">
        <a class="nav-link" href="map.php">
            <i class="fas fa-fw fa-table"></i>
            <span>Map View</span></a>
    </li> -->
    <!-- Nav Item - Tables -->

    <li class="nav-item">
        <a class="nav-link" href="preferences.php">
            <i class="fas fa-fw fa-table"></i>
            <span>Preferences</span></a>
    </li>


    <li class="nav-item">
        <a class="nav-link" href="edit-profile.php">
            <i class="fas fa-fw fa-table"></i>
            <span>Edit Profile</span></a>
    </li>
   
    <!-- Divider -->
    <hr class="sidebar-divider d-none d-md-block">

    <!-- Sidebar Toggler (Sidebar) -->
    <div class="text-center d-none d-md-inline">
        <button class="rounded-circle border-0" id="sidebarToggle"></button>
    </div>

    <!-- Sidebar Message -->
    <div class="sidebar-card d-none d-lg-flex">
        <img class="sidebar-card-illustration mb-2" src="img/undraw_rocket.svg" alt="...">
        <p class="text-center mb-2"><strong>SB Admin Pro</strong> is packed with premium features, components, and more!</p>
        <a class="btn btn-success btn-sm" href="https://startbootstrap.com/theme/sb-admin-pro">Upgrade to Pro!</a>
    </div>

</ul>
<!-- End of Sidebar -->

<!-- Scroll to Top Button-->
<a class="scroll-to-top rounded" href="#page-top">
    <i class="fas fa-angle-up"></i>
</a>


<!-- Logout Modal-->
<div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
            </div>
            <div class="modal-body">Select "Logout" below if you are ready to end your current session.</div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                <button class="btn btn-primary" id="btn">Logout</button>
            </div>
        </div>
    </div>
</div>


