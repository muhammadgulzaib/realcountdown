const express = require("express");
const router = express.Router();
const AgentController = require("../../controllers/AgentController");
const AgentViewController = require("../../controllers/AgentViewsController");
const SellerController = require("../../controllers/SellerController");

function fromMe(req, res, next) {
  console.log("I am the url that's called");
  next();
}
router.get("^/$", AgentViewController.showLoginPage); 
router.post("/", AgentController.loginAgent); 
router.get("/register/step1(.html)?", AgentViewController.showRegisterOne); 
router.post("/register/step1", AgentController.registerAgentStepOne); 
router.get(
  "/register/step1/:email/:name",
  AgentViewController.showRegisterOneWithEmailAndName
); 
router.post(
  "/register/step1/:id",
  AgentController.registerAgentStepOneWithEmailAndPassword
); 
router.get("/register/step2", AgentViewController.showRegisterTwo); 
router.post("/register/step2", AgentController.registerAgentStepTwo); 
router.get("/register/step3(.html)?", AgentViewController.showRegisterThree); 
router.post("/register/step3", AgentController.registerAgentStepThree); 
router.get("/register/step4(.html)?", AgentViewController.showRegisterFour); 
router.post("/register/step4", AgentController.registerAgentStepFour); 
router.get("/main", AgentViewController.showIndexPage); 
router.get("/edit-profile", fromMe, AgentViewController.editProfile); 
router
  .post("/edit-profile", fromMe, AgentController.updateProfile) 
  .post("/edit-password", fromMe, AgentController.changePassword); 

router.get("/logout", AgentController.handleLogout);  
router.get("/payment/:id", AgentViewController.getPayment);  
router.get("/charity/:id", AgentViewController.getCharity);  
router.post("/charity/:id", AgentController.saveCharityDetails); 
router.get("/seller-countdown", AgentViewController.getSellerBidsPage); 
router.post("/seller-countdown", AgentViewController.getSellerBidsPage); 
router.get("/seller-countdown/:id", AgentViewController.getSellerBidsPage);
//buyer countdown urls
router.get("/buyer-countdown", AgentViewController.getBuyerBidsPage);
router.post("/buyer-countdown", AgentViewController.getBuyerBidsPage); 
router.get("/buyer-countdown/:id", AgentViewController.getBuyerBidsPage); 
router.get("/buyer/:id", AgentViewController.getPropertyDetails); 
router.get("/details/:id", AgentViewController.getPropertyDetailsBuyer); 
router.post("/bid-property/:id/:uid", AgentController.bidForProperty); 
router.post("/update-bid", AgentController.updateBid); 

router.post("/bid/:id/:uid", AgentController.bidOnProperty); 
router.get("/waiting-bids", AgentViewController.getWaitingBids); 
router.get("/accept-bid/:id/:propertyID", AgentController.acceptBid); 
router.get("/reject-bid/:id/:propertyID", AgentController.rejectBid); 
router.get("/accept-buyer-bid/:id/:propertyID", AgentController.acceptBuyerBid); 
router.get("/reject-buyer-bid/:id/:propertyID", AgentController.rejectBuyerBid); 

router.get("/seller-chat", AgentViewController.chatWithSeller); 
router.get("/admin-chat", AgentViewController.chatWithAdmin); 
router.get("/buyer-chat", AgentViewController.chatWithBuyer); 
router.get("/current-bid/:id", AgentViewController.chatWithCurrentBid); 
router.get("/accepted-bids", AgentViewController.getAcceptedBids); 
router.post("/change-profile", AgentController.changeProfilePicture); 
router.post("/chat-admin", AgentController.chatWithAdmin); 
router.get("/my-countdown", AgentViewController.getMyCountdown); 
router.get("/chat/:id/:state", AgentViewController.getChatPage); 
router.post("/chat/:id/:state", AgentController.chatWithParticularRole); 
router.post("/chat-seller/:id/:state", AgentController.chatSeller); 
router.get("/rejected-bids", AgentViewController.getRejectedBids); 
router.get("/promotional-messages", AgentViewController.getPromotionalMessage); 
router.post("/promotional-message", AgentController.setPromotionalMessage); 
router.get("/payment-buyer/:id", AgentViewController.getPaymentBuyer); 
router.get("/payment-seller/:id", AgentViewController.getPaymentSeller); 
router.get("/charity-buyer/:id", AgentViewController.getCharityBuyer); 
router.post("/charity-buyer/:id", AgentController.setCharityBuyer); 
router.post("/charity-seller/:id", AgentController.setCharitySeller); 
router.get("/charity-seller/:id", AgentViewController.getCharitySeller); 
router.get("/buyer-listing/:id", AgentViewController.getBuyerListing); 
router.post("/buyer-listing/:id", AgentViewController.getBuyerListing);
router.post("/send-promotional-message/:id", AgentController.setBuyerListing); 
router.post(
  "/send-promotional-message-seller/:id",
  AgentController.setSellerListing
); 
router.get("/seller-listing/:id", AgentViewController.getSellerListing); 
router.post("/seller-listing/:id", AgentViewController.getSellerListing); 
router.post(
  "/send-promotional-message",
  AgentController.sendPromotionalMessage
); 
router.post("/rebid/:uid/:aid/:pid", AgentController.rebid); 
router.get("/register-plan/:id", AgentViewController.getRegisterationPlans); 
router.get("/register-charity/:id", AgentViewController.getRegisterCharity); 
router.post(
  "/registration-charity/:aid",
  AgentViewController.saveCharityLocation
); 
router.get("/successfull-bids", AgentViewController.getSuccessfullBids); 
router.get("/invite/:uid/:state", AgentController.inviteOnSuccess); 
router.get("/referral-agreement", AgentViewController.getReferralAgreement); 
router.post(
  "/referral-agreement/:aid",
  AgentController.reactToReferralAgreement
); 
router.get("/map", AgentViewController.getMap); 
router.get("/prefrences", AgentViewController.getPreferences); 
router.post("/setpayment", AgentController.getPayment); 
router.get("/promotional-plan-purchased", AgentController.promotionPlanPurchased); 
router.post("/set-registration-payment", AgentController.setRegistrationPayment); 
router.get("/success-registration-payment", AgentController.registrationPlanPurchased); 
router.post("/set-countdown-payment", AgentController.setCountDownPayment); 
router.get("/success-coutdown-package", AgentController.countDownPlanPurchased); 

module.exports = router;
