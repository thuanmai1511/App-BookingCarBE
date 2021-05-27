const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    room: String,
    messages: Array,
});
const chat = mongoose.model('chat', chatSchema, 'chat');

module.exports= chat;