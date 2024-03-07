import  { useState } from 'react';
import { toast } from 'react-toastify';
let t = `https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=`

export interface items {
    "author": string | undefined,
    "title": string | undefined,
    "description": string | undefined,
    "url": "https://www.msn.com/en-in/news/world/space-x-successfully-launches-american-astronauts-and-russian-cosmonaut/vi-BB1jhpOv",
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
            toast.success(err.message)
        }
       }
 return (
    <div className="max-w-700 w-full min-h-screen flex justify-center items-between snap-start" onClick={()=>setShare(e=>!e)}>
      <div className="p-2 ">
            <div className="relative rounded-lg overflow-hidden bg-blue-50 dark:bg-slate-800 dark:text-slate-400 dark:bg-opacity-3" style={{minHeight:'90vh'}}> 
                <div className="min-w-700 realtive" style={{minWidth:'320px'}}>
                    <img className="h-52 min-w-full object-cover" src={item.urlToImage?item.urlToImage:t} alt="Card image" />
                </div>
                <h1 className="text-2xl font-bold my-2 dark:text-slate-300">{item.title}</h1>
                <p className="text-lg">{item.content?item.content:"No Story"}</p>
                 {share&&<div className="absolute  inset-x-0 bottom-0 mb-5">
                     
                        <a href="https://monu-shaw.github.io/portfolio/" target='_blank' className="text-blue-600 absolute bottom-6 my-8 text-center -translate-x-9">
                             Developed By Monu Shaw
                        </a>
                     
                     <button className="bg-opacity-40 backdrop-blur-md bg-white text-black px-4 py-2 rounded-lg hover:bg-opacity-60 transition-all duration-200" onClick={shareFn}>
                        <i className="bi bi-share-fill" /> Share
                     </button>
                 </div>}
            </div>
        </div>
    </div>
 );
}