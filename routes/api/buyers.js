const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const BuyerController = require('../../controllers/BuyerController');
const BuyerViewsController = require('../../controllers/BuyerViewController');
const SellerController = require('./../../controllers/SellerController')
router.get('/', BuyerViewsController.getLogin) 
router.get('/register', BuyerViewsController.getRegister) 
router.post('/', BuyerController.loginUser) 
router.post('/register', BuyerController.registerBuyer) 
router.get('/logout', BuyerController.handleLogout) 
router.get('/edit-profile', BuyerViewsController.showProfile) 
router.get('/main', BuyerViewsController.showIndex); 
router.get('/add-property', BuyerViewsController.getAddProperty); 
router.post('/add-property', BuyerController.addProperty); 
router.get('/start-countdown', BuyerController.startCountDown) 
router.get('/start-countdown/:id', BuyerViewsController.getCountdown); 
router.post('/set-countdown/:id', BuyerController.setCountdown); 
router.get(
    '/promotional-messages',
    BuyerViewsController.getPromotionalMessages
); 
router.get('/chat-admin', BuyerViewsController.chatAdmin); 
router.get('/chat-agent/:aid', BuyerViewsController.chatAgent); 
router.post('/chat-admin', BuyerController.chatAdmin); 
router.get('/accepted-bids', BuyerViewsController.getAcceptedBids); 
router.get('/rejected-bids', BuyerViewsController.getRejectedBids); 
router.get('/waiting-bids',BuyerViewsController.getWaitingBids); 
router.get('/accept-bid/:aid/:pid', BuyerController.acceptBid); 
router.get('/reject-bid/:aid/:pid', BuyerController.rejectBid); 
router.get('/state-listing', BuyerViewsController.getStateListing); 
router.get('/country-listing', BuyerViewsController.getCountryListing); 
router.post('/country-listing', BuyerViewsController.getCountryListing); 
router.get('/state-listing/:id', BuyerViewsController.getStateListing); 
router.get('/country-listing/:id', BuyerViewsController.getCountryListing); 
router.post('/chat-agent/:id', BuyerController.chatAgent) 
router.post('/invite-to-bid/:aid/:state', BuyerController.sendInvitation); 
router.get('/invite-again/:aid/:pid',BuyerController.sendInviteToBidAgain );  
router.get('/successful-bids', BuyerViewsController.getSuccessfulBids); 
router.post('/invite-on-success/:aid',BuyerController.sendInviteOnSuccess); 
router.post('/edit-details/:aid', BuyerController.editProfile) 
router.post('/edit-password-picture', BuyerController.updatePassword) 
router.post('/toggle-messages', BuyerController.turnPromotionalMessages); 
router.get('/delete-promotional-messages', BuyerController.deletePromotionalMessages) 
router.post('/account-details', BuyerController.postAccountDetails); 
router.get('/details-one-message/:mid', BuyerController.deleteMessage); 
router.get('/map', BuyerViewsController.getMap); 
module.exports = router;
