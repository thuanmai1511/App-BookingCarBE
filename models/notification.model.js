const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    idHost : {type: Schema.Types.ObjectId , ref: 'user'},
    idUser : String,
    title: String,
    text : String,
    date : String,
    time : String,
    car : {type: Schema.Types.ObjectId , ref: 'formCars'}
});
const noti = mongoose.model('notification', notificationSchema,'notification');



module.exports= noti;