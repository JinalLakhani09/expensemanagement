const mongoose = require("mongoose");
const expenseschema = new mongoose.Schema({
  user_id: {type:Number,default:0},
  category:{type:String,default:""},
  amount:{type:Number,default:0},
  date:{type:Date,default:null},
  description:{type:String,default:""}
},
{
    timestamps: true
});
const Expense = mongoose.model("expense", expenseschema);
module.exports = Expense;


