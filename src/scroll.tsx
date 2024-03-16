import  { useState } from 'react';
import { toast } from 'react-toastify';
let t = `https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=`

export interface items {
    "author": string | undefined,
    "title": string | undefined,
    "description": string | undefined,
    "url": string | undefined,
    "urlToImage": string | undefined,
    "publishedAt": "2024-03-05T06:07:30Z",
    "content": string | undefined
}
export interface ScrollableCardProps {
    k: Number;
    item: items
   }
export default function ScrollableCard({item}: { item: items; }) {
    const [share,setShare] = useState(false)
    const shareFn = async () => {
        try {
           await navigator.share({
            title: item.title?item.title:'',
            text: item.content?item.content:"No Story",
            url: item?.url,
           });
           toast.success("Shared")
        } catch (error) {
            const err = error as Error;
            console.log(err.message);
            
            
        }
       }
 return (
    <div className="max-w-500 w-full min-h-screen flex justify-center items-between snap-start" onClick={()=>setShare(e=>!e)}>
      <div className="">
            <div className="relative rounded-lg overflow-hidden bg-blue-50 dark:bg-slate-800 dark:text-slate-400 dark:bg-opacity-3" style={{minHeight:'99vh'}}> 
                <div className="min-w-700 realtive" style={{minWidth:'320px'}}>
                    <img className="h-52 min-w-full object-cover" src={item.urlToImage?item.urlToImage:t} alt="Card image" />
                    <div className="absolute -translate-y-6 mx-3 px-2">
                        <button className="bg-opacity-50 backdrop-blur-sm bg-white text-black py-1 px-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" onClick={shareFn}>
                            {item.author}
                        </button>
                    </div>
                </div>
                <h1 className="text-2xl font-bold my-2 dark:text-slate-300 my-4">{item.title}</h1>
                <p className="text-lg">{item.content?item.content:"No Story"}</p>
                 {share&&<div className="absolute  inset-x-0 bottom-0 mb-5 pb-2">
                     
                        <a href="https://monu-shaw.github.io/portfolio/" target='_blank' className="text-blue-600 absolute bottom-6 my-8 text-center -translate-x-9">
                             Developed By Monu Shaw
                        </a>
                    
                     <div className="flex justify-center items-center backdrop-blur-md p-6">
                        <button className="bg-opacity-40 backdrop-blur-md bg-white text-black py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" onClick={shareFn}>
                        <i className="bi bi-share-fill" /> Share 
                        </button>
                        <button className="ml-4 bg-opacity-40 backdrop-blur-md bg-white text-black py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                          <a href={item.url} target="_blank" rel="noopener noreferrer"> <i className="bi bi-book" /> Read</a>
                        </button>
                        </div>
                 </div>}
            </div>
        </div>
    </div>
 );
}