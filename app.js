require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require("mongoose")
const cors = require('cors');
const News = require("./init/News")

app.use(express.json());
app.use(cors());

// require('./aajTak');
// require('./hindustan_times');
// require('./inc42');
// require('./the_hindu');
// require('./medical_news');
// require('./health_line');
// require('./indian_express');
// require('./india_today');
// require('./mint');
// require('./business_standard');
// require('./times_of_india');
// require('./news18');
// require('./enviro_india_today');
// require('./ndtv');
// require('./ev');

const PORT = process.env.PORT;

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}
main().then(res => console.log("connected"));
main().catch(err => console.log(err));

app.listen(PORT , (req, res) => {
  console.log("listening");
})

app.get('/',(req,res)=>{
  res.send("hi");
})

app.get('/news', async (req, res) => {
  let { page, limit } = req.query;
  const pageNum = parseInt(page) || 1;  // Default to page 1
  const limitNum = parseInt(limit) || 10;  // Default to limit 10
  const offset = (pageNum - 1) * limitNum;
  try {
    const data = await News.find().sort({ _id: -1 }).skip(offset).limit(limitNum);
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/news/search', async (req, res) => {
  let { query, page, limit } = req.query;
  const pageNum = parseInt(page) || 1;  
  const limitNum = parseInt(limit) || 5;  
  const offset = (pageNum - 1) * limitNum;
  console.log(query);

  try {
    const searchConditions = {
      $text: {
        $search: query
      }
    };

   const data = await News.find(searchConditions)
  .sort({ score: { $meta: "textScore" }, _id: -1 })
  .skip(offset)
  .limit(limitNum)
  .select('title content img_url date source category read_more score')
  .select({ score: { $meta: "textScore" } });

    res.status(200).json(data);
    console.log(data);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


  app.get('/news/:category', async (req, res) => { 
    try {
      const { category } = req.params;
      // console.log(Category: ${category});
        let { page, limit } = req.query;
  
      const pageNum = parseInt(page) || 1;  
      const limitNum = parseInt(limit) || 10;  
  
      const offset = (pageNum - 1) * limitNum;
  
      const data = await News.find({ category }) 
        .sort({ _id: -1 }) 
        .skip(offset) 
        .limit(limitNum); 
  
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching news by category:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

