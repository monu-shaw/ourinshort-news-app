const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

// Define the Mongoose schema based on the provided JSON structure
const articleSchema = new mongoose.Schema({
 source: {
    id: String,
    name: String
 },
 url: String,
 author: String,
 title: String,
 description: String,
 urlToImage: String,
 publishedAt: {
   type: Date,
   required: true,
   default: Date.now,
 },
 content: String,
 category:String
});

const Article = mongoose.model('Article', articleSchema);

// Connect to MongoDB
const connectToDatabase = async () => {
 if (mongoose.connection.readyState >= 1) {
    return;
 }
 return mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 });
};



   exports.handler = async (event, context) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await connectToDatabase();
        

        const article = await Article.find({}).sort({_id:-1}).limit(200);
        
        function shuffleArray(array) {
         for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
         }
         return array;
        }
        
        let resArray = shuffleArray([...article]);
        

       return {
         statusCode: 200,
         body: JSON.stringify({ status:200, message: 'Updated successfully!', article:resArray }),
       };
    } catch (error) {
        console.log(error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Error updating data', error }),
       };
    }
   };