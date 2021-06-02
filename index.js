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
// const { updateOne } = require('./models/products.model');
const { log, time } = require('console');
const { send } = require('process');


const app = express();
const socket = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socket(server, {
    cors:true,
})
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');


const Checkout = require('./models/checkout.model');
const User = require('./models/user.model');
const Coupon = require('./models/discount.model');
const Admin = require('./models/admin.model');
const FormCar = require('./models/formCar.model');
const Notification  = require('./models/notification.model')
const Chat = require('./models/chat.model')



server.listen(port, () => console.log(`Example app listening`))

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));



 
io.on('connection', (socket) => {

  socket.on('join', ({ name, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room })

      if(error) return callback(error);

      socket.join(user.room)
  })

  socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id)

      io.to(user.room).emit('message', { user: user.name, data: message })

      Chat.findOne({room: user.room })
      .then(data => {
          const { messages } = data;
          messages.unshift(message[0]);
          const newMessages = messages
          const condition = {room: user.room}
          const handler = { messages: newMessages }
          Chat.updateOne(condition, handler)
          .then(() => {})
      })
  })

  socket.on('disconnect', () => {
      console.log('User had left !!');
  })
})




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
const { resolveSoa } = require('dns');
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
  // console.log(req.body.tokenDevice);
  User.find({email: req.body.usernameAPI})
  .then((result)=> {

    if(result[0].password == md5(req.body.passwordAPI)){
      const set = {

        tokenDevices:  [...result[0].tokenDevices, { value: req.body.tokenDevice}]
      }
      User.updateOne({_id: result[0]._id}, set).then(()=>{})
      
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
  FormCar.find({}).populate('idUser')
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

app.get('/checkoutAdmin' , async function(req ,res){
   const data = await Checkout.find({}).populate('idUserCheckOut').populate('idCar').populate('idHost')
   .then(dt=>{
     res.send(dt)
   })
 
})

app.get('/statictis' , async function(req ,res){
  await Checkout.find({})
  .then(dt=>{
    // console.log(dt.price);
    res.send(dt)
  })

})


app.get('/numberUser' , async function(req , res){
   await User.find({})
  .then(dt=>{
    const n = dt.length
    res.send({n})
  })
})

app.get('/onTop' , function(req, res){
  
  var n = 0
  Checkout.find({}).populate('idCar').populate('idHost').then(dt=>{
    
   res.send(dt)

  })

})
app.post('/hgCar' , function(req , res){
  // console.log(req.body.id);
  FormCar.findOne({_id : req.body.id}).populate('idUser').then(dt=>{
    res.send(dt)
  })
})
app.get('/numberBrowsingCar' , function(req ,res){
  FormCar.find({status : true}).then(dt=>{
      res.send({n : dt.length})
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
  const location = req.body.location;
  const addressCurr = req.body.addressCurr;
  const expresss = req.body.express;
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
    express : expresss,
    sunroof: sunroof,
    bluetooth: bluetooth,
    gps: gps,
    map: map,
    cameraback: camera,
    imagesCar: imageCars,
    addresss: addressCurr,
    location: location
   
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
 
  FormCar.find({_id: id}).populate('idUser')
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
  // console.log(type);
  FormCar.find({address: type}).then(dt=>{
    res.send(dt)
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
  // console.log(req.body );
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
  // console.log(user);
 
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
    
    res.send(data?.favorite)
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




app.post('/getLatLong' , function(req ,res){

const idC = req.body.idCar;
FormCar.findOne({_id : idC})
.then((data)=>{
  res.send(data)
})

})




app.post('/checkout' , function(req ,res){
  // console.log(req.body.location);
  Checkout.create({
    feeExpress :req.body.fee,
    dateNumber: req.body.DateNumber,
    dateStart: req.body.dateStart,
    arrDate : req.body.arrDates,
    dateEnd: req.body.dateEnd,
    idCar : req.body.idCar ,
    idUserCheckOut : req.body.idUser,
    idHost : req.body.idH[0],
    price : req.body.price,
    status : req.body.resp,
    locationCheckOut : req.body.location,
    currDate: req.body.dateCurr,
    moneyPaid : req.body.prices,
    service : req.body.serviceFee
  })
  res.send(200)
})
  




app.post('/myOrders' ,async function(req ,res){
  // console.log(req.body.id);
  const data = await Checkout.find({}).sort({currDate : -1}).populate('idUserCheckOut').populate('idCar')
  // console.log(data);
  const newData = data.filter(dt => dt.idHost == req.body.id)
  // console.log(newData);
  res.send(newData)
  


})


app.post('/myOrderss' ,async function(req ,res){
  // console.log(req.body.id);
  const data = await Checkout.find({_id :req.body.id }).populate('idUserCheckOut').populate('idCar')
  // console.log(data);
  // const newData = data.filter(dt => dt.idHost == req.body.id)
  // console.log(data);

  res.send(data)
  


})

app.post('/Confirm' , function(req ,res) {
    // console.log(req.body);
  const id = req.body.idConfirm;
  const num = req.body.numConfirm;
  const idUser = req.body.id;
  // console.log(id ,num,idUser)
  Checkout.updateOne({_id: id}, {status: num})
  .then(() => {
    User.findOne({_id: idUser}).then(dt=>{
      // console.log(dt.tokenDevices);
      res.send(dt.tokenDevices)
    })
  })
})

app.post('/unConfirm' , function(req ,res) {
  // console.log(req.body);
const id = req.body.idConfirm;
// const num = req.body.numConfirm;
// console.log(id ,num);

  Checkout.findOneAndDelete({_id: id})
  .then(() => {
    res.send(200)
 
  })
})

app.post('/userAuthen' ,function(req ,res){
  const idu = req.body.id;
  // console.log(idu);
  FormCar.find({idUser : idu})
  .then(dt=>{
    res.send(dt)
    // console.log(dt);
  })
 
})
app.post('/userAuthens' ,function(req ,res){
  const idu = req.body.id;
  // console.log(idu);
  FormCar.find({idUser : idu})
  .then(dt=>{
    res.send(dt)
    // console.log(dt);
  })
 
})

app.post('/getDataMyTrip', async function(req , res){
  const ids = req.body.idUser;
  const data=  await Checkout.find({}).sort({currDate : -1}).populate('idHost').populate('idCar')
  const newData = data.filter(dt=>dt.idUserCheckOut == ids )
  res.send(newData)

})

app.post('/getDataMyTrips', async function(req , res){
  const ids = req.body.idDetail;
  const data=  await Checkout.find({_id : ids}).populate('idHost').populate('idCar')
  // console.log(data);
  // const newData = data.filter(dt=>dt.idUserCheckOut == ids )
  res.send(data)
  // console.log(data);

})


app.post('/ratingAPI' , async function(req ,res){

  const condition = {_id: req.body.IdHost}
  await FormCar.findOne(condition).then(async(data) => {
      const set = {
          review: [
              ...data.review,
          {
              date : req.body.dates,
              rating: req.body.rating,
              comment: req.body.com,
              idRating: req.body.idRating
          }]
      }
      await FormCar.updateOne(condition, set)
    
    
      res.send(200)
  })
 
})

app.post('/reviewAPI' , async function(req ,res){
  // console.log(req.body.id);

  const condition = {_id : req.body.id}
  await FormCar.findOne(condition).populate('review.idRating').sort({date: -1}).then(dt=>{
    // console.log(dt?.review);
    res.send(dt?.review)
  })
  // res.send(200)
})


app.post('/Completed' ,function(req ,res){
  // console.log(req.body);
  Checkout.updateOne({_id: req.body.id}, {checkCompleted: req.body.number})
  .then(() => {
    res.send(200)
  })
})

app.post('/dateChecked' , function(req ,res){
  const idc = req.body.id;
  // console.log(idu);
  Checkout.find({idCar: idc})
  .then(async (dt) => {
    const getDate = await dt.map(item => {
      // console.log(item);
        return {day : item.arrDate , st : item.status}
    })

    const data = [];
    getDate.map(item => {
      // item.map(item2 => {
      //   data.push(item2)
      // })
      // console.log(item);
    //  console.log(item);
      data.push(item)
    })
    res.send(data)
    // console.log(data);
  })
})




app.post('/relatedCar' , function(req ,res){
  // console.log(req.body);
  FormCar.find({address : req.body.ad}).then(dt=>{
    res.send(dt)
  })
})


app.post('/delToken' , function(req , res){
  const {id, token} = req.body;
  User.findOne({ _id: id })
  .then((data) => {
    const tokenFilter = data.tokenDevices.filter(item => {
      return item.value != token
    })
    User.updateOne({ _id: id }, { tokenDevices: tokenFilter })
    .then(() => res.sendStatus(200))
  })

})

app.post('/getToken', function(req , res){
    const condition = {_id : req.body.id}
    User.findOne(condition).then(dt=>{
      res.send(dt)
    })
})


app.post('/notificationRes', function(req ,res){
  // console.log(req.body);
  Notification.create({
    idHost : req.body.idh, 
    idUser : req.body.u,
    title : req.body.title,
    text :  req.body.text, 
    date : req.body.dateNoti,
    time : req.body.time
    
  })
  res.send(200)
})

app.post('/notificationRess', function(req ,res){
  // console.log(req.body);
  Notification.create({
    idHost : req.body.idh, 
    idUser : req.body.idu,
    title : req.body.title,
    text :  req.body.text, 
    date : req.body.dateNoti,
    time : req.body.time,
    car : req.body.car
  })
  res.send(200)
})
app.post('/dataNoti' , function(req ,res){
  // console.log(req.body.value);
  const condition = {idHost : req.body.value}
  Notification.find(condition).sort({date: 1,time : -1}).populate('idHost').populate('car').then(dt=>{
    res.send(dt)
  })
})

app.post('/getNumberTrip' , function(req , res){
  // console.log(req.body.id);
  Checkout.find({idCar : req.body.id}).then(dt=>{
    // console.log(dt.length); 
    const number = dt.length;
    res.send({number})
      // res.send(number)
  })
})

app.post('/checkroom' , async function(req, res){
    const room = req.body.room;
    // console.log(room);
    const isCheck = await Chat.findOne({ room: room })
    if(!isCheck) {
        Chat.create({
            room: room,
            messages: []  
        }).then(() => {
            res.json({create: true})
        })
    }
    res.sendStatus(200)
})


app.post('/showMessages' , function(req, res){
  const room = req.body.room;
    Chat.find({room: room})
    .then(data =>{
        res.json(data)
    })
})
app.post('/cancel' ,function(req ,res){
  const condition = {_id : req.body.id}
  Checkout.findOneAndDelete(condition)
  .then(() => {
    res.send(200)
  })
})


app.post('/getTokenCancelTrip', function(req , res){
  const condition = {_id : req.body.idH}
  User.findOne(condition).then(dt=>{
    res.send(dt)
  })
})

app.post('/notificationCancelTrip', function(req ,res){
  // console.log(req.body);
  Notification.create({
    idHost : req.body.idh, 
    idUser : req.body.idu,
    title : req.body.title,
    text :  req.body.text, 
    date : req.body.dateNoti,
    time : req.body.time,
    car : req.body.car
  })
  res.send(200)
})

app.post('/ratingCustomer' , async function(req ,res){

  const condition = {_id: req.body.idCheckout}
  await User.findOne(condition).then(async(data) => {
      const set = {
          review: [
              ...data.review,
          {
              date : req.body.dates,
              rating: req.body.rating,
              comment: req.body.com,
              idRating: req.body.idRating
          }]
      }
      await User.updateOne(condition, set)
    
    
      res.send(200)
  })
 
})