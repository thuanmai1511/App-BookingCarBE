const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const formCarSchema = new mongoose.Schema({
    idUser: {type: Schema.Types.ObjectId , ref: 'user'},
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
    status: Boolean,
    location: {
        coords: {
            latitude: Number,
            longitude: Number,
            altitude: Number | null,
            accuracy: Number | null,
            altitudeAccuracy: Number | null,
            heading: Number | null,
            speed: Number | null,
        },
        timestamp: Number
    },
    addresss : String,
    review : [{
        comment: String,
        date: String,
        idRating:  {type: Schema.Types.ObjectId , ref: 'user'},
        rating: Number
    }],
});
const formCars= mongoose.model('formCars', formCarSchema,'formCar');



module.exports= formCars;