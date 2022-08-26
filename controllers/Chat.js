const res = require('express/lib/response');
const { Message } = require('../models/Users');

const Chat = async (message, sender, to, messageSender) => {
    try {
       await Message.updateOne({  senderOne: sender,
            senderTwo: to, },  { $set:{'viewMessage':false} })
        const data = await Message.findOne({
            senderOne: sender,
            senderTwo: to,
        });
        if (!data) {
            const messageThread = await Message.create({
                senderOne: sender,
                senderTwo: to,
                
            });
            messageThread.chat.push({
                senderId: messageSender,
                message: message,
            
                sendAt: new Date(),
            });
            await messageThread.save();
            return true;
        } else {
            data.chat.push({
                senderId: messageSender,
                message: message,
                sendAt: new Date(),
            });

            await data.save();
            return true;
        }
    } catch (err) {
        return {
            status: false,
            errorMessage: err.message,
        };
    }
};

const readMessages = async (from, to) => {
    try {
        const data = await Message.findOne({
            senderOne: from,
            senderTwo: to,
        });

        return data;
    } catch (err) {
        return {
            status: false,
            errorMessage: err.message,
        };
    }
};
module.exports = { Chat, readMessages };
