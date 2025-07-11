const mongoose = require("mongoose");
const userschema = new mongoose.Schema({
  id: {type:Number,default:0},
  name:{type:String,default:""},
  email:{type:String,default:""},
  status:{type:String,default:""}
},
{
    timestamps: true
});
const User = mongoose.model("user", userschema);
