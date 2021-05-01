const mongoose=require('mongoose');
const postSchema=mongoose.Schema({
    date:{
        type:Number,
        required:true
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    hour:{
        type:Number,
        required:true
    },
    mail:{
        type:String,
        required:true
    },
    minutes:{
        type:Number,
        required:true
    },
    success:{
        type:Boolean,
    }
});

module.exports=mongoose.model('Posts',postSchema);