const mongoose = require("mongoose");
const categoryschema = new mongoose.Schema({
  id: {type:Number,default:0},
  name:{type:String,default:""}
},
{
    timestamps: true
});
const Category = mongoose.model("category", categoryschema);


