const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const AdminController = require('../../controllers/AdminController');
const AdminViewsController = require('../../controllers/AdminViewsController');
router
    .get('^/$', AdminViewsController.showLoginPage) 
    .post('/register', AdminController.registerAdmin) 
    .get('/main', AdminViewsController.showIndex) 
    .get('/delete-agent', AdminController.deleteAgent) 
    .post('^/$', AdminController.loginAdmin) 
    .get('/logout', AdminController.handleLogout) 
    // .get("/refresh-token", AdminController.handleRefreshToken)
    .get('/approve-agent', AdminController.approveAgent) 
    .get('/disapprove-agent', AdminController.disapproveAgent) 
    .get('/edit-profile', AdminViewsController.editProfilePage) 
    .post('/edit-profile', AdminController.editProfileCredentials) 
    .post('/change-password', AdminController.changePassword) 
    .get('/chat-seller', AdminViewsController.getSellerToAdminChat) 
    .post('/send-message/:id', AdminController.replyMessage) 
    .get('/chat-agent', AdminViewsController.getAgentToAdminChat) 
    .post('/chat-agent/:id', AdminController.replyMessageAgent) 

    //TODO: implement these methods *RESPONSIBLE FOR VIEWS*
    .get('/chat-buyer', AdminViewsController.getBuyerChat) 
    .get('/seller-review', AdminViewsController.getSellerReview) 
    .get('/buyer-review', AdminViewsController.getBuyerReview) 
    .get('/agent-review', AdminViewsController.getAgentReview) 
    .get(
        '/agent-to-seller-message',
        AdminViewsController.getAgentToSellerMessages
    ) 
    .get(
        '/agent-to-buyer-message',
        AdminViewsController.getAgentToBuyerMessages
    ) 
    .get('/create-agent-profile', AdminViewsController.getCreateAgentProfile) 

    .get(
        '/customize-notification',
        AdminViewsController.getCustomizeNotification
    ) 
    .get('/promotional-listing', AdminViewsController.getPromotionalListing) 
    .get(
        '/promotional-agent-to-seller-message',
        AdminViewsController.getPromotionalAgentToSellerMessage
    ) 
    .get(
        '/promotional-agent-to-buyer-message',
        AdminViewsController.getPromotionalAgentToBuyerMessage
    ) 
    .get(
        '/referral-agreement-agent-to-seller',
        AdminViewsController.getReferralAgreementAgentToSeller
    ) 
    .get(
        '/referral-agreement-agent-to-buyer',
        AdminViewsController.getReferralAgreementAgentToBuyer
    ) 
    .get('/invited-agent', AdminViewsController.getInvitedAgent) 
    .get('/charity-donation', AdminViewsController.getCharityDonation); 
//! POST METHODS
router.post('/edit-agent/:id', AdminController.editAgentDetails);
router.post('/edit-agent/:agentId', AdminController.editAgent); 
router.post('/edit-seller/:id', AdminController.editSellerDetails); 
router.post('/delete-seller/:id', AdminController.deleteSeller); 
router.post('/unapprove-seller/:id', AdminController.unapproveSeller); 
router.post('/edit-buyer/:id', AdminController.editBuyerDetails); 
router.post('/delete-buyer/:id', AdminController.deleteBuyer); 
router.post('/unapprove-buyer/:id', AdminController.unapproveBuyer); 
 
router.post('/delete-agent/:id', AdminController.deleteAgent); 
router.post('/unapprove-agent/:id', AdminController.unapproveAgent); 
router.get('/approve-role/:id/:role', AdminController.upproveRole); 
router.get('/delete-role/:id/:role', AdminController.deleteRole); 
router.get('/disapprove-role/:id/:role', AdminController.disapproveRole); 
router.post('/send-referral-agreement/:id/:pid/:uid/:bid/:state', AdminController.sendReferralAgreement) 
router.post(
    '/edit-or-approve-message/:messageId/:state',
    AdminController.editOrApproveMessageAgentToSeller
); 
router.post(
    '/edit-or-approve-message-seller/:messageId/:state',
    AdminController.editOrApproveMessageAgentToSeller
); 
router.post('/create-agent-profile', AdminController.setInviteAgent);
router.post(
    '/edit-promotional-message/:id/:buyerId',
    AdminController.editPromotionalMessage
); 
router.post(
    '/edit-promotional-message-seller/:id/:sellerId',
    AdminController.editPromotionalMessageSeller
); 
router.post('/approve-agent/:id', AdminController.approveAgentInvited); 
router.post('/dissapprove-agent/:id', AdminController.disapproveAgentInvited); 
router.get('/delete-notification/:mid', AdminController.deleteNotification) 
router.get('/delete-all-notification', AdminController.deleteAllNotification) 
router.get('/viewmessage-seller/:senderOne/:senderTwo', AdminController.viewMessageSeller) 
router.get('/viewmessage-buyer/:senderOne/:senderTwo', AdminController.viewMessageBuyer) 
module.exports = router;
