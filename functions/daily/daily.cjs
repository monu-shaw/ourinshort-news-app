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
    let url = "https://www.indiatoday.in/"+cat;
    const content = await axios(url).then((re) => {
       const $ = cheerio.load(re.data);
       
       const contentWrapElements = $('.B1S3_story__card__A_fhi');
       const storyShortContElements = $('.B1S3_story__shortcont__inicf p');
       const pic = $('.thumb.playIconThumbContainer > img');
       const aHref = $('.B1S3_story__thumbnail___pFy6 > a');
       let extractedContent = [];
       contentWrapElements.each((index, element) => {
           const contentWrap = $(element).find("h2 a").text();
           const storyShortCont = storyShortContElements[index] ? $(element).find(".B1S3_story__shortcont__inicf p").text() : '';
           const img = pic[index] ? $(element).find('.thumb img').attr('src') : '';
           const url = aHref[index] ? "https://www.indiatoday.in" + $(element).find("h2 a").attr("href") : '';
   
           extractedContent.push({
             "source": {
               "id": null,
               "name": "msnNOW"
             },
             url,
             "author": 'India Today',
             "title": contentWrap,
             "description": storyShortCont,
             "urlToImage": img,
             "content": storyShortCont,
             category:cat
           });
       });
   
       return extractedContent;
    });
   
    console.log(JSON.stringify(content, null, 2));
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