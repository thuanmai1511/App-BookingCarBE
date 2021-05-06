    const mongoose = require('mongoose');
    const favorite = require('./favorite.model');

    const Schema = mongoose.Schema;


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
        favorite: [],
        review : [{
            comment: String,
            date: String,
            idRating:  {type: Schema.Types.ObjectId , ref: 'user'},
            rating: Number
        }],
        tokenDevices : {
            type: [
                {
                    value: String
                }
            ]
        }
    });




    const user = mongoose.model('user', userSchema, 'user');



    module.exports= user;