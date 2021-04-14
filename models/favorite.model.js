const mongoose = require('mongoose');


const favoriteSchema = new mongoose.Schema({
    carName : String,
    carModel : String,
    idUser : String,
    idCar : String,
    imageCar : String,
    price: String,
    transmission : String,
    fuel : String ,
    city: String ,
    district : String,
    ward : String ,
    status: Boolean
});
const favorite = mongoose.model('favorite', favoriteSchema,'favorite');



module.exports= favorite;