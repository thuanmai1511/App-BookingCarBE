require('dotenv').config();

const path = require('path');
const port = 8080;

const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');
const bodyParser = require('body-parser');
// const logger = require('morgan');
const { router } = require('json-server');
const { constants, loadavg } = require('os');
const md5 = require('md5');
const { updateOne } = require('./models/products.model');
const { log } = require('console');
const { send } = require('process');


const Product = require('./models/products.model');
const User = require('./models/user.model');
const Coupon = require('./models/discount.model');
const Admin = require('./models/admin.model');
const FormCar = require('./models/formCar.model');

const app = express();

app.listen(port, () => console.log(`Example app listening`))

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// app.use(logger('dev'));

mongoose.connect(process.env.MONGO_URL, (err) =>{
   if(err){
     console.log("Error! " + err);
   }else{
     console.log("successful mongoose connection!");
   } 
});

var conn = mongoose.connection;
// upload images
const multer = require("multer");
const { exec } = require('child_process');
const { isError } = require('util');
const { IncomingMessage } = require('http');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "./uploads/images")
      
  },
  filename: function (req, file, cb) {
      console.log(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})
const uploadUser = multer({storage: storage});


var storages = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "./uploads/GPLX")
      
  },
  filename: function (req, file, cb) {
      // console.log(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})
const uploadUsers = multer({storage: storages});

var storagess = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "./uploads/imagesCar")
      
  },
  filename: function (req, file, cb) {
      // console.log(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})
const uploadUserss = multer({storage: storagess});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, '/uploads')));









// Login 

app.post('/login', function(req , res){
  // console.log(req.body);
  User.find({email: req.body.usernameAPI})
  .then((result)=> {
    // console.log(result[0].password);
    // console.log("---------------");
    // console.log(md5(req.body.passwordAPI));
    if(result[0].password == md5(req.body.passwordAPI)){
      res.status(200).send({
      "message": 'Đăng nhập thành công',
      'valid' : true,
      "id": result[0]._id,
      "email": result[0].email
      })
    } else {
      res.status(200).send({
          
      "message": "Sai mật khẩu",
      'valid' : false
      })
    }
  }).catch(err => {
        res.status(200).send({
        'message': "Tài khoản không tồn tại",
        'valid' : false
        })
  })
})
// LoginAdmin
app.post('/loginAdmin', function(req, res){
  Admin.find({admin: req.body.admin})
   .then((resq)=> {
    //  console.log(resq[0].password, req.body.password);
     
     if(resq[0].password == req.body.password){
 
       res.status(200).send({
         valid: true,
         message: "Successful Login",
         id: resq[0]._id
     })
            
         
     }else {
       res.status(200).send({
         valid: false,
         message: "Password Wrong"
       })
     }
   })
  })
// Signup

app.post('/signup', function( req, res){
  const username = req.body.usernameAPI;
  const password = md5(req.body.passwordAPI);
  const rePassword = md5(req.body.rePasswordAPI);
  const currDates = req.body.currDate;
  
  if(rePassword == password) {
    res.status(200).send({
      "message": 'Đăng ki thành công',
      "valid": true
    })
    User.create({
      email: username,
      password: password,
      currDate: currDates
      },function(err, user){
       if(err){
        console.log(err);
       }else {
        // console.log("Added successful" + user.email);
       }
       
    })
  }else {
      res.status(200).send({
      "message": "Mật khẩu không khớp",
      'valid' : false
      })
  }
})

app.post('/editGender' , function( req ,res){
  const id = req.body.id;
  const gender = req.body.gender;
  
  // console.log(id , gender);
  User.findOne({_id: id,})
  .then(data => {
    // console.log(data);
    User.updateOne(
      {_id: id}, {gender: gender}
    ).then(() => {
      res.json(200)
    })
  })
})

app.post('/editPhone' , function( req ,res){
  const id = req.body.id;
  const phone = req.body.phone;
  
  // console.log(id , gender);
  User.findOne({_id: id,})
  .then(data => {
    // console.log(data);
    User.updateOne(
      {_id: id}, {phone: phone}
    ).then(() => {
      res.json(200)
    })
  })
})
app.post('/editBirthday' , function( req ,res){
  const id = req.body.id;
  const birthday = req.body.birthday;
  
  User.findOne({_id: id,})
  .then(data => {
    // console.log(data);
    User.updateOne(
      {_id: id}, {birthday: birthday}
    ).then(() => {
      res.json(200)
    })
  })
})
app.post('/editName' , function( req ,res){
  const id = req.body.id;
  const name = req.body.name;
  
  User.findOne({_id: id,})
  .then(data => {
    // console.log(data);
    User.updateOne(
      {_id: id}, {name: name}
    ).then(() => {
      res.json(200)
    })
  })
})


app.post('/dataProfile' , function(req , res){
  const idu = req.body.id;
  // console.log(idu);
  User.find({ _id: idu })
  .exec((err ,data) => {
    if(err){
      console.log("error");
    }else {
      res.send(data)
    }
  })
})

// DataProfile admin  
app.get("/dataProfileadmin" , function(req ,res ){
  User.find({})
  .exec((err ,data) => {
    if(err){
      console.log("error");
    }else {
      res.send(data)
    }
  })
})
app.get("/dataCarAdmin" , function(req ,res ){
  FormCar.find({})
  .exec((err ,data) => {
    if(err){
      console.log("error");
    }else {
      res.send(data)
    }
  })
})

app.post('/updateStatus' , function(req , res) {
  // console.log(req.body.status);
  // console.log(req.body.id);
  const id = req.body.id;
  const Status = req.body.status;
  // console.log(Status);
  FormCar.findOne({_id: id,})
  .then(data => {
    // console.log(data);
    FormCar.updateOne(
      {_id: id}, {status: Status}
    ).then(() => {
      res.json(200)
    })
  
  })
})

app.post('/upload', uploadUser.single('photo'), (req, res) => {
  // console.log(req);
  const id = req.body.id;
  const linkImage = req.file.path;
  // console.log(linkImage);
  console.log(id , linkImage);
  User.findOne({_id: id})
  .then(data => {
    User.updateOne({_id: id} , { images: linkImage }).then(() => {
      res.json(200)
    })
  })
})
app.post('/uploadImageGPLX', uploadUsers.single('photo'), (req, res) => {
  // console.log(req.body);
  const id = req.body.ids;
  // console.log(id);
  const linkImageGPLX1 = req.file.path;
  console.log(id ,linkImageGPLX1);

  console.log("==========================");
  console.log(linkImageGPLX1);
  console.log(req.body.status, typeof(req.body.status));
  if(req.body.status ==='1'){
    User.updateOne({_id: id},{ imagesGPLX: {font: linkImageGPLX1}}).then(() => { 
      res.json(200)
    })


      User.findOne({_id: id})
        .then(doc=>{
          console.log(doc);
          doc['imagesGPLX']['font'] = linkImageGPLX1;
          doc.save()
          res.json("Complete0")
        })
  }
  if(req.body.status ==='2'){
    
    User.findOne({_id: id})
        .then(doc=>{
          console.log(doc);
          doc['imagesGPLX']['end'] = linkImageGPLX1;
          doc.save()
          res.json("Complete")
        })
  
  }
  res.json(400)
    
})

app.post('/uploadCar', uploadUserss.single('photo'), (req, res) => {
  const id = req.body.id;
  const linkImages = req.file.path; 


  res.send({ uri: linkImages})

  
})



app.post('/formCar' , function(req ,res){
  // console.log(req.body); 

  const idUser = req.body.idUser;
  const licen = req.body.licenseplatesAPI;
  const years = req.body.yearAPI;
  const seat = req.body.seatsAPI;
  const price = req.body.price;
  const transmission = req.body.transmissionAPI;
  const fuel = req.body.fuelAPI;
  const model = req.body.modelsAPI;
  const brand = req.body.brandsAPI;
  const sunroof = req.body.sunroofAPI;
  const bluetooth = req.body.bluetoothAPI;
  const gps = req.body.gpsAPI;
  const map = req.body.mapAPI;
  const camera = req.body.cameraback;
  const note = req.body.noteAPI;
  const fueled = req.body.fueledAPI;
  const address = req.body.address;
  const district = req.body.district;
  const ward = req.body.ward;
  const imageCars = req.body.imageCar;
  // console.log(imageCars);

  // console.log(idUser,licen,years,seat,price,transmission,fuel,model,brand,sunroof,bluetooth,gps,map,camera,note,fueled,address,district,ward);
  // console.log();
  FormCar.create({
    idUser: idUser,
    transmission: transmission,
    licenseplates: licen,
    year: years,
    seats: seat,
    price: price,
    carName: model,
    carModel: brand,
    fuel: fuel,
    address: address,
    district: district,
    ward: ward,
    fueled: fueled,
    note: note,
    sunroof: sunroof,
    bluetooth: bluetooth,
    gps: gps,
    map: map,
    cameraback: camera,
    imagesCar: imageCars
   
    },function(err){
     if(err){
      console.log(err);
     }else {
      // console.log("Added successful" + user.model);
     }
     
  })

  res.send(200)
})
  

app.get("/getformCar" , function(req , res){
  // const statusExec = true;
    FormCar.find({})
    .exec((err,data)=>{
      if(err){
        console.log(err);
      }else {
        res.json(data)
        // console.log(data);
        // res.send(200)
      }
    })
    
})

app.get("/detailCar/:id" , function(req , res){
  // console.log(req.params.id);

  const id = req.params.id;
 
  FormCar.find({_id: id})
    .exec((err, data)=>{
      if(err){
        console.log(err);
      }else {
        res.json(data)
      }
    })
    

  // res.send(200)
})

app.get("/discount" , function(req ,res){
  Coupon.find({})
  .exec((err , data)=>{
    if(err){
      console.log(err);
    }else {
      res.json(data)
    }
  })
})

app.post("/selectedCoupon" , async(req , res) => {
  const idCouponAPI = req.body.idCoupon;
  const data = await Coupon.findOne({_id : idCouponAPI})
  res.json(data.discount) 

})



app.get("/getDetailCar/type=:type" , function(req ,res){
  // console.log(req.params.type);
  const type= req.params.type;
  console.log(type);
  FormCar.find({address: type})
    .exec((err, data)=>{
      if(err){
        console.log(err);
      }else {
        res.json(data)
      }
    })
})

app.post("/getmycar" , function(req ,res){
  // console.log(req.body);
  const idu = req.body.ids;
  // console.log(idu);
  FormCar.find({idUser: idu})
  .then(data=>{
    // console.log(data);
    res.send(data)
  })
  
})


app.post("/addFavorites" , async function(req ,res){
 
  const idUsers = req.body.value;
  const idCars = req.body.idCar;
  const user = await User.findOne({_id : idUsers})

  const index = user?.favorite.indexOf(idCars)
  if(index==-1){
      user?.favorite.push(idCars)
  }else{
      user?.favorite.splice(index,1)
  }
  user.save()
 
  res.send(200);
  

})





app.post('/getfavoriteCar' ,function(req , res){
  const iduser = req.body.idu;
  User.findOne({_id : iduser})
  .then(data=>{
    FormCar.find({_id:{"$in": data.favorite  }}).then(datas=>{
      // console.log(datas);
      res.send(datas)
    })
    
  })
  
})

app.post('/selected' , function(req ,res){
  const iduser = req.body.values;
  // console.log(iduser);
  User.findOne({_id: iduser})
  .then(data=>{
 
    res.send(data.favorite)
    // console.log(data.favorite);
  })
})

app.post('/isGPLX' , function(req ,res){
  const iduser = req.body.ids;
  // console.log(iduser);
  User.findOne({_id: iduser})
  .then(data=>{
 
    res.send(data.imagesGPLX)
    
  })
})

app.post('/isName' , function(req ,res){
  const iduser = req.body.value;
  // console.log(iduser);
  FormCar.findOne({_id : iduser})
  .then(datas=>{
    // res.send(data.idUser)
    User.findOne({_id : datas.idUser}).then(data=>{
      res.send({name: data.name, email: data.email, img: data.images})
    })
    // console.log(data.name);
  })
})










// // Delete Cart
// app.post('/deleteCart', function(req ,res) {
//   let id = req.body.id;
//   console.log(id);
//   Cart.findOneAndDelete({
//     _id: id
//   }).then(()=> {
//     res.json(200)
//   })
// })

// // Orders
// app.post("/Order", function(req, res) {
//   var dateTime = new Date();
//   // console.log(dateTime);
//   var name = req.body.name;
//   var address = req.body.address;
//   var email = req.body.email;
//   var phone = req.body.phone;
//   var order = req.body.order;
//   var userId = req.body.userId;
//   var note = req.body.note;
//   var total = req.body.total;
  
//   console.log(total);
//   Order.create({
//     name: name,
//     address: address,
//     product: order,
//     email: email,
//     userId: userId,
//     note: note,
//     status: "",
//     date: dateTime,
//     total: total,
//     phone: phone

//   }, function(err){
//       if(err) {
//         console.log("error");
//       } else {
//         console.log("Added success order" + name);
//       }
//   })
// })  // no k co update do


// app.get('/Order/:idUser' ,function(req, res){
//   const idUser = req.params.idUser;
//   // console.log(idUser);
//   Order.find({'userId': idUser})
//   .exec( (err,data)=>{
//     if(err){
//       console.log("err");
//     }else {
//       res.json(data);
//       // console.log(data);
//     }
//   })
// })


// app.get('/Order' ,function(req, res){
 
//   Order.find({})
//   .exec( (err,data)=>{
//     if(err){
//       console.log("err");
//     }else {
//       res.json(data)
      
//     }
//   })
// })

// // Admin 


// app.post('/loginAdmin', function(req, res){
//  Admin.find({admin: req.body.admin})
//   .then((resq)=> {
//     console.log(resq[0].password, req.body.password);
    
//     if(resq[0].password == req.body.password){

//       res.status(200).send({
//         valid: true,
//         message: "Successful Login",
//         id: resq[0]._id
//     })
           
        
//     }else {
//       res.status(200).send({
//         valid: false,
//         message: "Password Wrong"
//       })
//     }
//   })
//  })
// // Del Product Admin 

// app.post('/deleteProduct', function(req ,res) {
//   let id = req.body.id;
//   console.log(id);
//   Product.findOneAndDelete({
//     _id: id
//   }).then(()=> {
//     res.json(200)
//   })
// })
// // Del Order Admin
// app.post('/deleteOrder', function(req ,res) {
//   let id = req.body.id;
//   // console.log(id);
//   Order.findOneAndDelete({
//     _id: id
//   }).then(()=> {
//     res.json(200)
//   })
// })

// // view order

// app.get('/viewOrder' , function(req, res) {
//   Order.find({})
//   .exec((err,data)=>{
//     if(err) {
//       console.log("Err");
//     } else {
//       res.json(data)
//     }
//   })
// })


// app.post('/updateStatus' , function(req , res) {
//   // console.log(req.body.status);
//   // console.log(req.body.id);
//   const id = req.body.id;
//   const Status = req.body.status;
//   console.log(Status);
//   Order.findOne({_id: id,})
//   .then(data => {
//     // console.log(data);
//     Order.updateOne(
//       {_id: id}, {status: Status}
//     ).then(() => {
//       res.json(200)
//     })
  
//   })
// })

// // add product admin
// app.post('/data', function(req,res){
//   const name = req.body.nameAdd;
//   const price = req.body.priceAdd;
//   const quantity = req.body.quantityAdd;
//   const kind = req.body.kindAdd;
//   const description = req.body.descriptionAdd;
//   const image = req.body.imageAdd;
  
//   Product.create({
//     name: name,
//     quantity: quantity,
//     price: price,
//     kind: kind,
//     description: description,
//     image: image
//   })

// })

// // edit products admin
// app.post("/data/id=",function(req ,res){
//   const id = req.body.id;
//   const name = req.body.nameEdit;
//   const price = req.body.priceEdit;
//   const image = req.body.imageEdit;
//   const quantity = req.body.quantityEdit;
//   const kind = req.body.kindEdit;

//     Product.updateOne({
//         _id: id},
//         { 
//         name: name,
//         quantity: quantity,
//         kind: kind,
//         price: price,
//         image: image
//         }
//     ).then(()=>{
//       res.json(200)
//     })
  
// })

// // discount
// app.get('/discount/' ,(req, res)=>{
//   console.log(req.query.value);

//   res.json(req.query.value==='flash25'?25:0)

// })





