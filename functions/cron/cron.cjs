const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const getArticles = async (cat) => {
    let url = "https://www.indiatoday.in/"+cat;
    const content = await axios(url).then((re) => {
       const $ = cheerio.load(re.data);
       
       const contentWrapElements = $('.B1S3_content__wrap__9mSB6 h2');
       const storyShortContElements = $('.B1S3_story__shortcont__inicf p');
       const pic = $('.thumb.playIconThumbContainer > img');
       const aHref = $('.B1S3_story__thumbnail___pFy6 > a');
       let extractedContent = [];
       contentWrapElements.each((index, element) => {
           const contentWrap = $(element).text();
           const storyShortCont = storyShortContElements[index] ? $(storyShortContElements[index]).text() : '';
           const img = pic[index] ? $(pic[index]).attr('src') : '';
           const url = aHref[index] ? "https://www.indiatoday.in" + $(aHref[index]).attr('href') : '';
   
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
             "publishedAt": "2024-03-05T06:07:30Z",
             "content": storyShortCont
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
   exports.handler = async (event, context) => {
    try {
       const {cat} = event.queryStringParameters;
       // Path to the result.json file
       const resultPath = path.join(process.cwd(), '../../../dist/result.json');
   
       // Read the existing JSON data
       const data = fs.readFileSync(resultPath, 'utf8');
       const result = JSON.parse(data);
   
       // Fetch new articles
       const newArticles = await getArticles(cat);
   
       // Add the new articles to the articles array
       result.articles = result.articles.concat(newArticles);
   
       // Write the updated data back to result.json
       fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
        console.log("Success");
       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Updated successfully!', cat }),
       };
    } catch (error) {
        console.log(error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Error updating data', error }),
       };
    }
   };