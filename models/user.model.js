const mongoose = require('mongoose');
const favorite = require('./favorite.model');


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    gender: String,
    birthday: String,
    currDate: String,
    images: String,
    imagesGPLX : {
        font: { 
            type: String,
            
        },
        end: {
            type: String,
          
        }

    },
    favorite: []
});




const user = mongoose.model('user', userSchema, 'user');



module.exports= user;