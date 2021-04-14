const mongoose = require('mongoose');


const formCarSchema = new mongoose.Schema({
    idUser: String,
    transmission: String,
    licenseplates: String,
    year : String,
    seats: String,
    price: String,
    carName : String,
    carModel: String,
    fuel : String,
    address: String,
    district: String,
    ward: String,
    fueled: String,
    note: String,
    sunroof: Boolean,
    bluetooth: Boolean,
    gps : Boolean,
    map: Boolean,
    cameraback : Boolean,
    imagesCar: String,
    status: Boolean
});
const formCars= mongoose.model('formCars', formCarSchema,'formCar');



module.exports= formCars;