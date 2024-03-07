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
    </div>
  )
}

export default App
