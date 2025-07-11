const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const category = require("./model/category");
const expense = require("./model/expense");
const user = require("./model/user");

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

mongoose.connect("mongodb+srv://jinallakhani9856:CzmQ14RkNEM3lRM3@cluster0.eep4aph.mongodb.net/").then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});


app.post('/expenses', async (req, res) => {
 console.log("hello")
});

app.post("/create/expenses", async (req, res) => { 
  try {
   const lastexpense = await expense.find().sort({ id: -1 }).limit(1);
    var id = 1;
    if(lastexpense.length !== 0){
        id = lastexpense[0].id + 1;
    }
    var reqBody = req.body;
   var data ={
    user_id: reqBody.user_id,
    category:reqBody.category,
    amount:reqBody.amount,  
    date:reqBody.date,
    description:reqBody.description,
   }

    const newexpense = await new expense(data).save()
    var message = "Expense created successfully";
    var status = 201;
     if(!newexpense){
        message = "Expense not created";
        status = 400;
     }

    res.json({
      status: status,
      message: message,
      data: newexpense
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});

app.post("/update/expenses", async (req, res) => { 
  try {
      var reqbody = req.body;
      const getexpense = await expense.find({ _id: reqbody._id });
      var message = "Expense updated successfully";
      var status = 200;
      var result = {};
       if(getexpense.length !== 0){
         result = await expense.findOneAndUpdate(
           { _id: reqbody._id },          
           { $set: { ...reqbody } } ,
           { new: true }        
        );
       }else{
        message = "Expense not found";
        status = 404;
       }
     
    res.json({
      status: status,
      message: message,
      data: result
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});

app.post("/delete/expenses", async (req, res) => { 
  try {
      var reqbody = req.body;
      const getexpense = await expense.find({ _id: reqbody._id });
      var message = "Expense deleted successfully";
      var status = 200;
      var result = {};
       if(getexpense.length !== 0){
         result = await expense.deleteOne(
           { _id: reqbody._id }     
        );
       }else{
        message = "Expense not found";
        status = 404;
       }
     
    res.json({
      status: status,
      message: message,
      data: result
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});

app.post("/expenses/Statistic/one", async (req, res) => { 
  try {
      var reqbody = req.body;
      var message = "Get Statistic result";
      var status =200
      const result = await expense.aggregate([
  {
    $addFields: {
      formattedDate: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$date",
          timezone: "Asia/Kolkata"
        }
      }
    }
  },
  {
    $group: {
      _id: { user_id: "$user_id", date: "$formattedDate" },
      total: { $sum: "$amount" }
    }
  },
  {
    $sort: { "total": -1 }
  },
  {
    $group: {
      _id: "$_id.user_id",
      topDays: {
        $push: {
          date: "$_id.date",
          total: "$total"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      user_id: "$_id",
      topDays: { $slice: ["$topDays", 3] }
    }
  }
]);

    res.json({
      status: status,
      message: message,
      data: result
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});

app.post("/expenses/Statistic/two", async (req, res) => { 
  try {
      var reqbody = req.body;
      var message = "Get Statistic result";
      var status =200
     const result = await expense.aggregate([
  {
    $addFields: {
      yearMonth: {
        $dateToString: {
          format: "%Y-%m",
          date: "$date",
          timezone: "Asia/Kolkata"
        }
      }
    }
  },
  {
    $group: {
      _id: { user_id: "$user_id", month: "$yearMonth" },
      totalAmount: { $sum: "$amount" }
    }
  },
  {
    $sort: {
      "_id.user_id": 1,
      "_id.month": 1
    }
  },
  {
    $group: {
      _id: "$_id.user_id",
      monthlyData: {
        $push: {
          month: "$_id.month",
          total: "$totalAmount"
        }
      }
    }
  },
  {
    $project: {
      user_id: "$_id",
      monthlyData: 1,
      percentageChange: {
        $cond: [
          { $gte: [ { $size: "$monthlyData" }, 2 ] },  // At least 2 months of data
          {
            $let: {
              vars: {
                lastMonth: { $arrayElemAt: ["$monthlyData", -1] },
                prevMonth: { $arrayElemAt: ["$monthlyData", -2] }
              },
              in: {
                $cond: [
                  { $eq: ["$$prevMonth.total", 0] },
                  null, // Avoid division by zero
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$$lastMonth.total", "$$prevMonth.total"] },
                          "$$prevMonth.total"
                        ]
                      },
                      100
                    ]
                  }
                ]
              }
            }
          },
          null
        ]
      }
    }
  }
]);
    res.json({
      status: status,
      message: message,
      data: result
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});

app.post("/expenses/Statistic/three", async (req, res) => { 
  try {
      var reqbody = req.body;
      var message = "Get Statistic result";
      var status =200
     const result = await expense.aggregate([
  // Step 1: Convert date to "yyyy-MM" string for grouping
  {
    $addFields: {
      yearMonth: {
        $dateToString: {
          format: "%Y-%m",
          date: "$date",
          timezone: "Asia/Kolkata"
        }
      }
    }
  },
  // Step 2: Group by user and month
  {
    $group: {
      _id: { user_id: "$user_id", month: "$yearMonth" },
      totalAmount: { $sum: "$amount" }
    }
  },
  // Step 3: Sort by user and month
  {
    $sort: {
      "_id.user_id": 1,
      "_id.month": 1
    }
  },
  // Step 4: Group all monthly totals into an array per user
  {
    $group: {
      _id: "$_id.user_id",
      monthlyData: {
        $push: {
          month: "$_id.month",
          total: "$totalAmount"
        }
      }
    }
  },
  // Step 5: Get average of last 3 months as prediction
  {
    $project: {
      user_id: "$_id",
      last3: { $slice: ["$monthlyData", -3] },
      predictedNextMonthExpenditure: {
        $cond: [
          { $gte: [{ $size: "$monthlyData" }, 3] },
          {
            $avg: {
              $map: {
                input: { $slice: ["$monthlyData", -3] },
                as: "monthData",
                in: "$$monthData.total"
              }
            }
          },
          null // Not enough data to predict
        ]
      }
    }
  }
]
);
    res.json({
      status: status,
      message: message,
      data: result
    });
  } catch (error) {
    console.error("Error creating Expense:", error);
     res.json({
      status: 500,
      message: "Internal Server Error",
      data: {}
    });
  }
});