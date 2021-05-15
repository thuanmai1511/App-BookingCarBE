const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const checkOutSchema = new mongoose.Schema({
    dateNumber: String,
    dateStart: String,
    dateEnd : String,
    arrDate : [],
    idCar : {type: Schema.Types.ObjectId , ref: 'formCars'},
    idUserCheckOut : {type: Schema.Types.ObjectId , ref: 'user'},
    idHost :  {type: Schema.Types.ObjectId , ref: 'user'},
    price : [],
    feeExpress : Number,
    status : String,
    checkCompleted : 0,
    locationCheckOut : [{
        
    }],
    currDate : String,
    moneyPaid : [],
    service : []
  
});
const checkout = mongoose.model('checkout', checkOutSchema,'checkout');



module.exports= checkout;