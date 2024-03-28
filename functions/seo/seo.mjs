import getLinkPreview from "monu-linkpreview";


const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  export const handler = async (event, context) => {
    try {
        console.log(event.queryStringParameters.url);
        let data = await getLinkPreview(event.queryStringParameters.url).then(re=>re)        
       return {
         statusCode: 200,
         headers,
         body: JSON.stringify({ message: 'MetaData', data }),
       };
    } catch (error) {
        console.log(error);
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Error updating data', error }),
       };
    }
   };