const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const SellerController = require('../../controllers/SellerController');
const SellerViewsController = require('../../controllers/SellerViewsController');
router
    .get('^/$', SellerViewsController.showLogin) 
    .post('/', SellerController.login) 
    .get('/register', SellerViewsController.showRegister) 
    .post('/register', SellerController.registerSeller) 
    .get('/main', SellerViewsController.showIndex) 
    .get('/logout', SellerController.handleLogout) 
    .post('/edit-profile', SellerController.editProfileCredentials) 
    .get('/edit-profile', SellerViewsController.showEditProfile) 
    .post('/change-password-image', SellerController.changePassword) 
    .get('/add-property', SellerViewsController.showAddProperty) 
    .get('/countdown', SellerViewsController.showCountDownPage) 
    .post('/countdown', SellerController.editCountDown) 
    .post('/add-property', SellerController.addProperty) 
    .get('/saved-properties', SellerViewsController.showSaveProperty) 
    .post('/edit-property', SellerController.editPropertyDetails) 
    .get('/start-countdown', SellerController.startCountDown) 
    .get('/waiting-bids', SellerViewsController.getWaitingBids) 
    .get('/accept-bid/:id/:propertyID', SellerController.acceptBid) 
    .get('/reject-bid/:id/:propertyID', SellerController.rejectBid) 
    .get('/accepted-bids', SellerViewsController.getAcceptedBids) 
    .get('/admin-chat', SellerViewsController.chatWithAdmin) 
    .post('/admin-chat', SellerController.sendMessageToAdmin) 
    .get('/agent-chat', SellerViewsController.chatWithAgent) 
    .post('/agent-chat/:id', SellerController.chatWithAgent) 
    .get('/rejected-bids', SellerViewsController.getRejectedBids) 
    .get('/bids-in-progress', SellerViewsController.getBidsInProgress) 
    .get('/successfull-bids', SellerViewsController.getSuccessfullBids) 
    .get('/state-listing', SellerViewsController.getStateListing) 
    .get('/state-listing/:id', SellerViewsController.getStateListing)
    .post(
        '/state-listing/:zipCode/:commisionRate',
        SellerController.getStateListing
    ) 
    .get('/country-listing/:id', SellerViewsController.getCountryListing) 
    .get('/country-listing/', SellerViewsController.getCountryListing)
    .post('/country-listing/', SellerViewsController.getCountryListing)
    .get('/chat/:id/:pid', SellerViewsController.getChatPage) 
    .get('/promotional-messages', SellerViewsController.getPromotionalMessages); 
router.post('/invite/:aid', SellerController.sendInvite); 
router.post('/invite-to-bid/:aid/:state',SellerController.sendInvitationToBid) 
router.get('/invite-again/:aid/:pid',SellerController.sendInviteToBidAgain ) 
router.post('/toggle-messages', SellerController.turnPromotionalMessages); 
router.get('/delete-promotional-messages', SellerController.deletePromotionalMessages) 
router.post('/account-details', SellerController.postAccountDetails); 
router.get('/details-one-message/:mid', SellerController.deleteMessage); 
router.get('/map', SellerViewsController.getMap); 
module.exports = router;
