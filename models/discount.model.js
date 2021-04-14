const mongoose = require('mongoose');


const discountSchema = new mongoose.Schema({
    name: String,
    note: String,
    discount: Number,
});
const discount = mongoose.model('discount', discountSchema,'discount');



module.exports= discount;