const e = require('express');
const { array } = require('joi');
const { Seller, Agent, Admin, Message, Bid } = require('../models/Users');
const { readMessages } = require('./Chat');

const { sendData } = require('./helperFunction');
const showRegister = (req, res) => {
    res.render('seller/seller-reg');
};
const showLogin = (req, res) => {
    res.render('seller/login');
};
const showIndex = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const user = await Seller.findOne({ email: req.session.user });
        console.log(user);
        const bids = await Bid.find({userId: user._id, role: 'Seller', status: 'Waiting'}).populate({
            path:'userId',
            model: 'Seller'
        }).populate({
            path: 'agentId',
            model: 'Agent'
        })
        console.log(bids);
        res.render('seller/index', {
            name: user.name,
            image: user.profilePicture,
            properties: user.properties,
            data: user,
            bids
        });
    } else {
        res.redirect('/seller/');
    }
};
const getMap = async (req, res)=>{
    if(req.session.user && req.session.role == 'seller'){
        const {nameSearch, addressSearch, zipSearch} = req.query;
        const agentQuery = {};
        if(nameSearch?.trim() || addressSearch?.trim() || zipSearch?.trim()){
            agentQuery['$or'] = [];
            if(nameSearch?.trim()){
                agentQuery['$or'].push({name:{'$regex':nameSearch, '$options':'i'}}) 
            }
            if(addressSearch?.trim()){
                agentQuery['$or'].push({brokerageAddress:{'$regex':addressSearch, '$options':'i'}}) 
            }
            if(zipSearch?.trim()){
                agentQuery['$or'].push({zipCode:{'$regex':zipSearch, '$options':'i'}}) 
            }
        }
        const seller = await Seller.findOne({email: req.session.user});
        const agents = await Agent.find(agentQuery).lean();
        return res.render('seller/map',{
            email: req.session.user,
            name: seller.name,
            image: seller.profilePicture,
            agents
        })
    }else{
        return res.redirect('/seller/')
    }
}
const showEditProfile = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const user = await Seller.findOne({ email: req.session.user });
        return res.render('seller/edit-profile', {
            name: user.name,
            image: user.profilePicture,
            user: {
                password: user.password,
                email: req.session.user,
                phone: user.phone,
            },
        });
    } else {
        return res.redirect('/seller/');
    }
};
const showAddProperty = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { name, profilePicture } = await Seller.findOne({
            email: req.session.user,
        });
        console.log(name);
        return res.render('seller/add-property', {
            email: req.session.user,
            name,
            image: profilePicture,
        });
    } else {
        return res.redirect('/seller/');
    }
};
const showCountDownPage = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { name, profilePicture, properties } = await Seller.findOne({
            email: req.session.user,
        });

        const property = properties.filter(
            (property) => property['_id'] == req.query.id
        );

        const today = new Date();
        const countDownOver = new Date(property[0]['countdownOverAt']);

        const over =
            countDownOver.getTime() - today.getTime() < 0 ? true : false;
        console.log(over);
        return res.render('seller/dcards', {
            email: req.session.user,
            name,
            image: profilePicture,
            property: property[0]['_id'],
            countdown: property[0]['countdown'],
            startDate: property[0]['updatedAt'],
            countdownOver: property[0]['countdownOverAt'],
            over: over,
        });
    } else {
        return res.redirect('/seller/');
    }
};
const showSaveProperty = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { name, profilePicture, properties } = await Seller.findOne({
            email: req.session.user,
        });
        let props = [];
        for(let property of properties){
            const bid = await Bid.exists({bidOnProperty: property._id, status: 'Accepted', bidOverAt: {$lte: new Date()}})
            if(bid){
                property.completed = true;
            }else{
                property.completed = false;
            }
            props.push(property)
        }
        return res.render('seller/save_data', {
            email: req.session.user,
            name,
            image: profilePicture,
            props,
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getWaitingBids = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const data = await Seller.findOne({ email: req.session.user })
        const waitingBids = await Bid.find({
            userId: data._id,
            role: 'Seller',
            status: 'Waiting'
        }).populate({
            path:'agentId',
            model: 'Agent'
        })
        return res.render('seller/waiting-bids', {
            email: req.session.user,
            name: data.name,
            image: data.profilePicture,
            properties: data.properties,
            waitingBids
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getRejectedBids = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const data = await Seller.findOne({ email: req.session.user })
        const rejectedBids = await Bid.find({
            userId: data._id,
            status: 'Rejected', bidOverAt: {$gte: new Date()}
        }).populate({
            path:'agentId',
            model: 'Agent'
        })


        return res.render('seller/rejected-bids', {
            email: req.session.user,
            name: data.name,
            image: data.profilePicture,
            properties: data.properties,
            rejectedBids
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getBidsInProgress = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const data = await Seller.findOne({ email: req.session.user }).populate(
            {
                path: 'properties',
                populate: {
                    path: 'agentBids',
                    populate: {
                        path: 'agentBid',
                        model: 'Agent',
                    },
                },
            }
        );

        var agentList = [];
        var props = [];
        data.properties.forEach((property) => {
            var bids = [];
            property.agentBids.forEach((agent) => {
                if (agent.status === 'Accepted') {
                    bids.push(agent);
                }
            });

            property.agentBids = bids;
        });

        return res.render('seller/bids-progress', {
            email: req.session.user,
            name: data.name,
            image: data.profilePicture,
            properties: data.properties,
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getAcceptedBids = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const data = await Seller.findOne({email: req.session.user})
        const bids = await Bid.find({role: 'Seller', status: 'Accepted', userId: data._id, bidOverAt: {$gte: new Date()}}).populate({
            path: 'userId',
            model: 'Seller'
        }).populate({
            path: 'agentId',
            model: 'Agent'
        })
        // let activeAcceptedBids = [];
        // for await(const bid of bids){
        //     const sellerProperty = await Seller.findOne(
        //         { _id: data._id, "properties._id": bid.bidOnProperty },
        //         "properties.$"
        //     );
        //     if(sellerProperty && new Date(sellerProperty?.properties[0]?.countdownOverAt)?.getTime() - new Date()?.getTime() > 0){
        //         activeAcceptedBids.push(bid);
        //     }
        // }

        return res.render('seller/accepted-bids', {
            email: req.session.user,
            name: data.name,
            image: data.profilePicture,
            properties: data.properties,
            bids: bids
        });
    } else {
        return res.redirect('/seller/');
    }
};
const chatWithAdmin = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        try {
            const data = await Seller.findOne({ email: req.session.user });
            const sellerId = data._id;
            const admin = await Admin.findOne({}, 'name _id profilePicture');
            const adminId = admin._id;

            const messages = await readMessages(sellerId, adminId);

            return res.render('seller/adminchat', {
                email: req.session.user,
                name: data.name,
                image: data.profilePicture,
                sellerId,
                messages,
                admin,
            });
        } catch (err) {
            req.flash('error',err.message);
            return res.redirect('/seller/admin-chat');
        }
    } else {
        return res.redirect('/seller/');
    }
};
const chatWithAgent = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const data = await Seller.findOne({ email: req.session.user })
        const bids = await Bid.find({
            userId: data._id,
            status: 'Accepted'
        }).populate({
            path: 'agentId',
            model:'Agent'
        })
        let msg = {}
        let msgThread = new Set();
        for(let bid of bids){
            let recievedMessages = await readMessages(data._id, bid.agentId._id)
            msg._id = bid.agentId._id;
            msg.messages = recievedMessages;
            msgThread.add(msg)
        }
   
        if(!msgThread.messages){  
            console.log("Called from inside if")
            return res.render('seller/chats', {
                email: req.session.user,
                name: data.name,
                image: data.profilePicture,
                properties: data,
                msgThread,
                bids
            });
        }
        let filteredVisibleMessages = [];
        msgThread.forEach((message) => {
            console.log("Called true")
            message?.messages?.chat.forEach((chat) => {
                if (chat.approved) {
                    filteredVisibleMessages.push(chat);
                } else if (chat.senderId.equals(data._id)) {
                    filteredVisibleMessages.push(chat);
                }
            });

            message.messages.chat = filteredVisibleMessages;
        });
        console.log(msgThread)
        return res.render('seller/chats', {
            email: req.session.user,
            name: data.name,
            image: data.profilePicture,
            properties: data,
            msgThread,
            bids
        });


    } else {
        return res.redirect('/seller/');
    }
};
// const getMessagesOfAllAgents = async (property, sellerId) => {
//     var messageThread = [];
//     for (let i = 0; i < property.agentBids.length; i++) {
//         let msg;
//         if (property.agentBids[i].status === 'Accepted') {

//         }
//         messageThread.push(msg);
//     }
//     return messageThread;
// };
const getSuccessfullBids = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { name, profilePicture, properties } = await Seller.findOne({
            email: req.session.user,
        });
        const seller = await Seller.findOne({email: req.session.user})
        const bids = await Bid.find({userId: seller._id, role: "Seller", status: 'Accepted', bidOverAt: {$lte: new Date()}}).populate({
            path: 'userId',
            model: 'Seller'
        }).populate({
            path: 'agentId',
            model: 'Agent'
        })
        var properitesWithInTimeRange = [];
        seller.properties.forEach((property) => {
            if (
              new Date(property.countdownOverAt).getTime() -
                new Date().getTime() >
              0
            ) {
              const arr = {
                user: seller,
                property: property,
              };
              properitesWithInTimeRange.push(arr);
            }
        });
        return res.render('seller/successful-bids', {
            email: req.session.user,
            name,
            image: profilePicture,
            bids,
            properitesWithInTimeRange
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getStateListing = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { id } = req.params;
        const seller = await Seller.findOne({
            email: req.session.user,
        })
        const { name, profilePicture, properties } = seller

        const agents = await Agent.find();

        var properitesWithInTimeRange = [];
        properties.forEach((property) => {
            if (
              new Date(property.countdownOverAt).getTime() -
                new Date().getTime() >
              0
            ) {
              const arr = {
                user: seller,
                property: property,
              };
              properitesWithInTimeRange.push(arr);
            }
        });

        return res.render('seller/state-listing', {
            hover_id:id,
            email: req.session.user,
            name,
            image: profilePicture,
            agents,
            properitesWithInTimeRange
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getCountryListing = async (req, res) => {
    if (req.session.user && req.session.role === 'seller') {
        const { id } = req.params;
        const { zipcode,Name,commision } = req.body;
        const seller = await Seller.findOne({
            email: req.session.user,
        })
        const { name, profilePicture, properties } = seller
        var agents=[]
          if(zipcode)
            {
                if(Name)
                {
                    if(commision){
                        agents = await Agent.find({zipCode:zipcode,name:{ $regex: '.*' + Name + '.*',$options: 'i' },commision});}
                    else{
                        agents = await Agent.find({zipCode:zipcode,name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
                    }

                }else {
                    if(commision){
                        agents = await Agent.find({zipCode:zipcode,commision});}
                    else{
                        agents = await Agent.find({zipCode:zipcode});
                    }
                 
                }
            }else{
                if(Name)
                {
                    if(commision){
                        agents = await Agent.find({name:{ $regex: '.*' + Name + '.*',$options: 'i' },commision});}
                    else{
                        agents = await Agent.find({name:{ $regex: '.*' + Name + '.*',$options: 'i' }});
                    }

                }else {
                    if(commision){
                        agents = await Agent.find({commision});}
                    else{
                        agents = await Agent.find();
                    }
                 
                }

            }

        var properitesWithInTimeRange = [];
        properties.forEach((property) => {
            if (
              new Date(property.countdownOverAt).getTime() -
                new Date().getTime() >
              0
            ) {
              const arr = {
                user: seller,
                property: property,
              };
              properitesWithInTimeRange.push(arr);
            }
        });

        return res.render('seller/country-listing', {
            hover_id:id,
            email: req.session.user,
            name,
            image: profilePicture,
            agents,
            properitesWithInTimeRange
        });
    } else {
        return res.redirect('/seller/');
    }
};

const getPromotionalMessages = async (req, res) => {
     
    if (req.session.user && req.session.role === 'seller') {
        const { name, profilePicture, properties } = await Seller.findOne({
            email: req.session.user,
        });
        const seller =await Seller.findOne({email: req.session.user})
        console.log(seller.promotionalMessageState);
        if(!seller.promotionalMessageState) {
            console.log('Nofouds')
            const promotionalMessages = {
                promotionalMessages: []
            }
            return res.render('seller/ProMsg', {
                email: req.session.user,
                name,
                image: profilePicture,
                promotionalMessages,
                state: seller.promotionalMessageState,
                promotionalBalance: seller.promotionalBalance
            });
        }
        const promotionalMessages = await Seller.findOne({
            email: req.session.user,
            'promotionalMessages.approve': true,
        }).populate({
            path: 'promotionalMessages',
            populate: {
                path: 'agentId',
                model: 'Agent',
            },
        });
        return res.render('seller/ProMsg', {
            email: req.session.user,
            name,
            image: profilePicture,
            promotionalMessages,
            state: seller.promotionalMessageState,
            promotionalBalance: seller.promotionalBalance
        });
    } else {
        return res.redirect('/seller/');
    }
};
const getChatPage = async (req, res) => {
    if (req.session.user && req.session.role == 'seller') {
        const { id, pid } = req.params;
        const seller = await Seller.findOne({
            email: req.session.user,
        });
        const agent = await Agent.findOne({ _id: id });
        const bids = await Bid.find({
            userId: seller._id,
            bidOnProperty: pid
        }).populate({
            path: 'agentId',
            model: 'Agent'
        })
        console.log(bid)
        return res.render('seller/chats', {
            email: seller.email,
            name: seller.name,
            image: seller.profilePicture,
            agent,
            seller,
            bids
        });
    } else {
        res.redirect('/seller/');
    }
};
module.exports = {
    showRegister,
    showLogin,
    showIndex,
    showEditProfile,
    showAddProperty,
    showCountDownPage,
    showSaveProperty,
    getWaitingBids,
    getAcceptedBids,
    chatWithAdmin,
    chatWithAgent,
    getBidsInProgress,
    getRejectedBids,
    getSuccessfullBids,
    getStateListing,
    getCountryListing,
    getPromotionalMessages,
    getChatPage,
    getMap
};
