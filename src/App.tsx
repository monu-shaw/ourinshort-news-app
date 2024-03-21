import React, { useEffect, useState } from 'react'
import './App.css'
import ScrollableCard, { items } from './scroll'
import axios from 'axios'

function App():React.ReactNode {
  const [count, setCount] = useState<items[]>(new Array<items>())
  const [loading, setLoading] = useState(true)
  const [er, setEr] = useState(false)
  useEffect(()=>{
    axios("/.netlify/functions/articles").then(r=>{
      if(r.data.status === 200){
        setCount(r.data.article)
      }
      setLoading(false)
    }).catch(err=>{
      console.log(err.message);
      setEr(true)
      setLoading(false)
      
    })
  },[])
  if(loading){
   return(<div className="flex flex-col justify-center items-center h-screen overflow-y-auto snap-y snap-mandatory">
      <h1 className='text-3xl'>Loading...</h1>
    </div>)
  }
  if(er){
    return(<div className="flex flex-col justify-center items-center h-screen overflow-y-auto snap-y snap-mandatory">
       <h1 className='text-3xl'>Error Occured</h1>
     </div>)
   }
  return (
    <div className="flex flex-col items-center h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {count.map((i)=>(
          <ScrollableCard item={i} />
      ))}
       <button
        className="fixed z-90 bottom-10 right-8 bg-transparent w-20 h-20 rounded-full drop-shadow-lg flex justify-center items-center text-white text-4xl hover:bg-blue-700 hover:drop-shadow-2xl hover:animate-bounce duration-300">
         <a href="https://monu-shaw.github.io/portfolio/" target='_blank'><i className="bi bi-github"></i></a> 
        </button>
    </div>
  )
}

export default App
