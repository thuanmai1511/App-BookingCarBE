const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
    admin: String,
    password: String
    

});
const admin = mongoose.model('admin', adminSchema, 'admin');



module.exports= admin;