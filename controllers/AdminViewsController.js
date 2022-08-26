const {
    Admin,
    Agent,
    Message,
    Seller,
    Buyer,
    InvitedAgent,
    Bid,
    Log,
    BankDetail,
    ReferralAgreement,
} = require('../models/Users');
const { sendData } = require('./helperFunction');
const { readMessages } = require('./Chat');
const showLoginPage = async (req, res) => {
    return res.render('admin/login');
};
const showIndex = async (req, res) => {
    const allAgents = await Agent.find();
    const allBuyers = await Buyer.find();
    const allSellers = await Seller.find();

    const count = await Agent.find().count();
    const successfullBidsCount = await Bid.find({status: 'Accepted', bidOverAt: {$lte: new Date()}}).count()
    const bidsInProgress = await Bid.find({status: {$ne: 'Rejected'}, bidOverAt: {$lte: new Date()}}).count()

    if (req.session.role === 'admin' && req.session.user) {
        return res.render('admin/index', {
            email: req.session.user,
            name: (await Admin.findOne({ email: req.session.user })).name,
            image: (await Admin.findOne({ email: req.session.user }))
                .profilePicture,
            allAgents,
            allBuyers,
            allSellers,
            count,
            successfullBidsCount,
            bidsInProgress
        });
    }
    return res.redirect('/admin/');
};
const editProfilePage = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const profile = await Admin.findOne({ email: req.session.user });
        return res.render('admin/edit-profile', {
            name: profile.name,
            password: profile.password,
            image: (await Admin.findOne({ email: req.session.user }))
                .profilePicture,
            admins: await Admin.find(),
        });
    }
    return res.redirect('/admin/');
};
const getSellerToAdminChat = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const profile = await Admin.findOne({ email: req.session.user });
        const messages = await Message.find({
            senderTwo: profile._id,
        }).populate({
            path: 'senderOne',
            model: 'Seller',
        });
        let filteredMessages = [];
        messages?.forEach((message) => {
            if (
                message?.senderOne?.role === 'seller' &&
                typeof message?.senderOne !== 'undefined'
            ) {
                filteredMessages.push(message);
            }
        });

        return res.render('admin/chat-seller', {
            name: profile.name,
            password: profile.password,
            image: profile.profilePicture,
            messages: filteredMessages,
            adminId: profile._id,
        });
    }
    return res.redirect('/admin/');
};
const getAgentToAdminChat = async (req, res) => {
    if (req.session.user && req.session.role == 'admin') {
        const profile = await Admin.findOne({ email: req.session.user });
        const messages = await Message.find({}).populate({
            path: 'senderOne',
            model: 'Agent',
        });

        let filteredMessages = [];
        messages?.forEach((message) => {
            if (
                message?.senderOne?.role === 'agent' &&
                typeof message?.senderOne !== 'undefined'
            ) {
                filteredMessages.push(message);
            }
        });
        return res.render('admin/chat-agent', {
            name: profile.name,
            password: profile.password,
            image: profile.profilePicture,
            messages: filteredMessages,
            adminId: profile._id,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const proAgentBuyer = (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        res.render('admin/pro-agent-buyer');
    } else {
        res.render(
            'errorpages/404',
            sendData(401, 'Unauthorized', '', '/admin/')
        );
    }
};
const getBuyerChat = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const profile = await Admin.findOne({ email: req.session.user });
        const messages = await Message.find({
            senderTwo: profile._id,
        }).populate({
            path: 'senderOne',
            model: 'Buyer',
        });
        let filteredMessages = [];
        messages?.forEach((message) => {
            if (
                message?.senderOne?.role === 'buyer' &&
                typeof message?.senderOne  !== 'undefined'
            ) {
                filteredMessages.push(message);
            }
        });

        return res.render('admin/chat-buyer', {
            name: profile.name,
            password: profile.password,
            image: profile.profilePicture,
            messages: filteredMessages,
            adminId: profile._id,
        });
    }
    return res.redirect('/admin/');
};
const getBuyerReview = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const buyers = await Buyer.find(
            {},
            'name email password address city state _id status'
        );
        const admin = await Admin.findOne({}, 'name profilePicture _id');
        return res.render('admin/buyer-review', {
            name: buyers.name,
            password: buyers.password,
            image: buyers.profilePicture,
            _id: admin._id,
            buyers: buyers,
        });
    } else {
        req.flash('error','Please login!');
        res.redirect('/admin/');
    }
};
const getSellerReview = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const sellers = await Seller.find(
            {},
            'name email password address city state _id status'
        );
        const admin = await Admin.findOne({}, 'name profilePicture _id');
        return res.render('admin/seller-review', {
            name: sellers.name,
            password: sellers.password,
            image: sellers.profilePicture,
            _id: admin._id,
            sellers: sellers,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getAgentReview = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const agents = await Agent.find(
            {},
            'name email password brokerageAddress city state _id status'
        );
        const admin = await Admin.findOne({}, 'name profilePicture _id');
        return res.render('admin/agent-review', {
            name: agents.name,
            password: agents.password,
            image: agents.profilePicture,
            _id: admin._id,
            agents,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getAgentToSellerMessages = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const sellers = await Seller.find();
        const agents = await Agent.find();
        const admin = await Admin.findOne({ email: req.session.user });
        let messages = [];
        for (let agent of agents) {
            const agentId = agent._id;
            for (let seller of sellers) {
                const sellerId = seller._id;
                const msg = await Message.find({sellerId,agentId });
                messages.push({
                    sellerName: seller.name,
                    agentName: agent.name,
                    sellerId,
                    agentId,
                    msg,
                });
            }
        }

        res.render('admin/seller-msg', {
            name: admin.name,
            password: admin.password,
            image: admin.profilePicture,
            messages,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getAgentToBuyerMessages = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const buyers = await Buyer.find();
        const agents = await Agent.find();
        const admin = await Admin.findOne({ email: req.session.user });
        let messages = [];
        for (let agent of agents) {
            const agentId = agent._id;
            for (let buyer of buyers) {
                const sellerId = buyer._id;
                const msg = await Message.find({ sellerId, agentId })
                messages.push({
                    sellerName: buyer.name,
                    agentName: agent.name,
                    sellerId,
                    agentId,
                    msg,
                });
            }
        }

        res.render('admin/buyer-msg', {
            name: admin.name,
            password: admin.password,
            image: admin.profilePicture,
            messages,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getCreateAgentProfile = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        res.render('admin/agent-view');
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getCustomizeNotification = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const Logs = await Log.find({})

        res.render('admin/customize-notification',{
            Logs
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getPromotionalListing = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const sellerBankDetails = await BankDetail.find({role: 'seller'}).populate({
            path: 'userId',
            model: 'Seller'
        })
        const buyerBankDetails = await BankDetail.find({role: 'buyer'}).populate({
            path: 'userId',
            model: 'Buyer'
        })
        res.render('admin/pro-listing',{
            sellers: sellerBankDetails,
            buyers: buyerBankDetails
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getPromotionalAgentToSellerMessage = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const sellers = await Seller.find(
            {},
            '_id name promotionalMessages'
        ).populate({
            path: 'promotionalMessages',
            populate: {
                path: 'agentId',
                model: 'Agent',
            },
        });
        
        res.render('admin/pro-agent-seller', {
            sellers,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getPromotionalAgentToBuyerMessage = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const buyers = await Buyer.find(
            {},
            '_id name promotionalMessages'
        ).populate({
            path: 'promotionalMessages',
            populate: {
                path: 'agentId',
                model: 'Agent',
            },
        });
        res.render('admin/pro-agent-buyer', {
            buyers,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getReferralAgreementAgentToSeller = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const bids = await Bid.find({
            status: 'Accepted',
            role: 'Seller'
        }).populate({
            path: 'userId',
            model: 'Seller'
        }).populate({
            path: 'agentId',
            model: 'Agent'
        })
        let successfullBids = [];
        for(const bid of bids){
            const agreement = await ReferralAgreement.findOne({bidId: bid._id});
            if(agreement){
                bid.agreement = agreement;
            }
            successfullBids.push(bid);
        }
   
        res.render('admin/agreement-seller',{
            successfullBids
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
   
};
const getReferralAgreementAgentToBuyer = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const bids = await Bid.find({
            status: 'Accepted',
            role: 'Buyer'
        }).populate({path:'userId',model:'Buyer'}).populate({path:'agentId',model:'Agent'})
        let successfullBids = [];
        for(const bid of bids){
            const agreement = await ReferralAgreement.findOne({bidId: bid._id});
            if(agreement){
                bid.agreement = agreement;
            }
            successfullBids.push(bid);
        }
    
        res.render('admin/agreement-buyer',{
            successfullBids
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }

};
const getInvitedAgent = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const agent = await Agent.find({ invited: true });
        res.render('admin/invited-agent', {
            agent,
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};
const getCharityDonation = async (req, res) => {
    if (req.session.user && req.session.role === 'admin') {
        const agents = await Agent.find({}, 'name _id charity registrationCharity  promotionalMessagesBuyer promotionalMessagesSeller')
        res.render('admin/charity', {
            agents
        });
    } else {
        req.flash('error','Please login!');
        return res.redirect('/admin');
    }
};

module.exports = {
    showLoginPage,
    showIndex,
    editProfilePage,
    getSellerToAdminChat,
    getAgentToAdminChat,
    proAgentBuyer,
    getBuyerChat,
    // TODO implement these
    getSellerReview,
    getBuyerReview,
    getAgentReview,
    getAgentToSellerMessages,
    getAgentToBuyerMessages,
    getCreateAgentProfile,
    getCustomizeNotification,
    getPromotionalListing,
    getPromotionalAgentToSellerMessage,
    getPromotionalAgentToBuyerMessage,
    getReferralAgreementAgentToSeller,
    getReferralAgreementAgentToBuyer,
    getInvitedAgent,
    getCharityDonation,
};
