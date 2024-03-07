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