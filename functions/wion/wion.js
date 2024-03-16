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



const getArticles = async (cat) => {
    let url = "https://www.wionews.com/"+cat;
 const content = await axios(url).then((re) => {
    const $ = cheerio.load(re.data);
    
    const contentWrapElements = $('.article-list-txt');
    
    let extractedContent = [];
    contentWrapElements.each((index, element) => {
        const contentWrap = $(element).find("h2 a").text()
        const storyShortCont = $(element).find("p").first().text()
        const img = cheerio.load($(element).parent().parent().find("noscript").html())('img').attr('src');
        const url = "https://www.wionews.com"+$(element).parent().parent().find("a").attr("href");

        extractedContent.push({
          "source": {
            "id": null,
            "name": "WION"
          },
          url,
          "author": 'WION',
          "title": contentWrap,
          "description": storyShortCont,
          "urlToImage": img,
          "content": storyShortCont,
          "category":cat
        });
    });

    return extractedContent;
 });
    return content;
   };
   
   exports.handler = async (event, context) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await connectToDatabase();
        const {cat} = event.queryStringParameters;
       
        const newArticles = await getArticles(cat);

        const article = await Article.insertMany(newArticles);

        // Close the database connection to avoid keeping it open
        mongoose.connection.close();

       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Updated successfully!', article }),
       };
    } catch (error) {
        console.log(error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Error updating data', error }),
       };
    }
   };