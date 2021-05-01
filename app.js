const express=require('express');
const nodemailer = require("nodemailer");
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const Email=require('./models/emails')
var cron = require('node-cron');
const Mail = require('nodemailer/lib/mailer');
app.use(bodyParser.json());
require('dotenv').config();

//ROUTES

app.post('/reschedule/:id',async(req,res)=>{
  
 try {
     console.log("hii")
     const email_exists=await Email.findById(req.params.id);
     if(email_exists){
        await Email.findByIdAndUpdate({
            "_id":req.params.id
        },{
            "date":req.body.date,
            "month":req.body.month,
            "year":req.body.year,
            "hour":req.body.hour,
            "minutes":req.body.minutes
        }, {
            upsert: true
        }
        );
        return res.json({"success":true,"msg":"email rescheduled successfully"});
     }else{
        return res.json({"success":false,"msg":"No such email"});
     }
 } catch (error) {
     console.log(error.message)
    res.json({"success":false,"msg":"Some error occured"});
 }
  
});
cron.schedule('* * * * *',async () => {
//    res.status(200).send({"msg":"corn initialted"});
   console.log("cron initiated")
   var today = new Date();
   var date=today.getDate();
   var month=today.getMonth()+1;
   var year=today.getFullYear();
   var hour=today.getHours();
   var minutes=today.getMinutes();
   var all_scheduled_emails=await Email.find();
   for(i=0;i<all_scheduled_emails.length;i++){
       console.log(all_scheduled_emails[i].date,date,"&",all_scheduled_emails[i].month,month,"&",all_scheduled_emails[i].year,year,"&",all_scheduled_emails[i].hour,hour,"&",all_scheduled_emails[i].minutes,minutes)
     if(all_scheduled_emails[i].date===date&&all_scheduled_emails[i].month===month&&all_scheduled_emails[i].year===year&&all_scheduled_emails[i].hour===hour&&all_scheduled_emails[i].minutes===minutes){
console.log(true);
try {
    await send_emails(all_scheduled_emails[i].mail);
    await Email.findOneAndUpdate({
        "date":req.body.date,
        "month":req.body.month,
        "year":req.body.year,
        "hour":req.body.hour,
        "minutes":req.body.minutes,
        "email":all_scheduled_emails[i].mail
    },{
        "success":true
    },{
        "upsert":true
    })
} catch (error) {
    console.log("errored",error.message);
    await Email.findOneAndUpdate({
        "date":req.body.date,
        "month":req.body.month,
        "year":req.body.year,
        "hour":req.body.hour,
        "minutes":req.body.minutes,
        "email":all_scheduled_emails[i].mail
    },{
        "success":false
    },{
        "upsert":true
    })
}

     }
   }
 });
 
app.post('/schedule_emails',async(req,res)=>{
    
    const { date,month,year,hour,minutes,mail} =req.body
    try {
        const email=new Email({
            date,month,year,hour,minutes,mail
        });
        await email.save();
        return  res.json({
            "success":true,
            "msg":"email scheduled successfully"
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({"msg":"all the fields are mandatory/invalid data entered"})
    };
   
});
app.get('/delete_scheduling/:id',async(req,res)=>{
    try {
        await Email.findOneAndRemove({"_id":req.params.id});
        return res.json({"success":true,"msg":"email deleted successfully"});
    } catch (error) {
        return res.json({"success":false,"msg":"Error while deleting the mail"});
    }
});
app.get('/list_emails',async(req,res)=>{
    try {
        if(req.query.success==true||req.query.success==false){
           var all_emails=await Email.find({"success":true,"data":req.query.success});
           return res.json(all_emails)
        }else{
            all_emails=await Email.find();
            return res.json(all_emails)
        }
    } catch (error) {
        return res.send({"msg":"something went wrong"})
    }
})
 let send_emails=async(email)=>{
     console.log(email)
    let transporter =await nodemailer.createTransport({
        service:'gmail',
        auth: {
          user:process.env.email, // generated ethereal user
          pass:process.env.password, // generated ethereal password
        },
      });
      let info = await transporter.sendMail({
        from:`"Sender" <akash@marmeto.com`, // sender address
        to: email, // list of receivers
        subject: "Hello ", // Subject line
        text: "Hello welcome to the mail scheduler app", // plain text bod
      });
      console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
 }
mongoose.connect("mongodb://localhost/big_app_project",{ useNewUrlParser: true ,useUnifiedTopology: true},
()=>console.log("connected to db"));
app.listen(3000);
