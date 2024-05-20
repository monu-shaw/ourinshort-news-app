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
   
   const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];
  
  async function run(text) {
    try {  
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });
    
      const result = await chatSession.sendMessage(`summerise the following atleast in 60 words and within 80 words \n ${text}`);
      console.log(result.response.text());
      return result.response.text()
    } catch (error) {
      return null
    }
  }
  let af=async (r)=>{
    let a = await run(r.description)
    return a? {...r,description:"** "+a} : {...r}
  }
   exports.handler = async (event, context) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await connectToDatabase();
        const {cat} = event.queryStringParameters;
       
        const newArticles = await getArticles(cat);
        const aiArticle = await Promise.all(newArticles.map(af))
        const article = await Article.insertMany(aiArticle)

        // const article = await Article.insertMany(newArticles);

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