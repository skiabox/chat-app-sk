import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    //find the conversation between the sender and receiver in the database
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    //save the conversation to the database
    // await conversation.save();
    //save the message to the database
    // await newMessage.save();

    // SOCKET IO FUNCTIONALITY WILL GO HERE

    //this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    console.log("getMessages controller inside try-catch block");
    //get the id of the user we are chatting with
    const { id: userToChatId } = req.params;
    console.log(
      "getMesages controller, after getting userToChatId: ",
      userToChatId
    );
    console.log(
      "getMessages controller, after getting userToChatId (type of userToChatId) ",
      typeof userToChatId
    );
    //get the id of the logged in user
    const senderId = String(req.user._id);
    console.log("getMessages controller, after getting senderId: ", senderId);
    console.log(
      "getMessages controller, after getting senderId (type of senderId) ",
      typeof senderId
    );
    //find the conversation between the sender (logged in user) and receiver in the database
    const conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, userToChatId]
      }
    }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

    if (!conversation) return res.status(200).json([]);

    //get the messages from the conversation
    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
