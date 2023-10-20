import { useState } from 'react'
import { Public, Secret, apiLoad } from './api/api'
import './App.css'

function App() {
  const [endPoint, setEndPoint] = useState("")
  const [visitorType, setVisitorType] = useState("")
  const [apiData, setApiData] = useState<Public[] | Secret[]>([])
  const [error, setError] = useState("")
  
  const buttonHandler = async (type: string) => {
    setEndPoint(`api/${type}`)
    setVisitorType(type)
    const response = await apiLoad(endPoint, visitorType)
    if(!response.success){
      setError("No data!")
    }else{
      setApiData(response.data)
    }
  }
    
  return (
    <>
      <button onClick={() => buttonHandler("public")}>Public</button>
      <button onClick={() => buttonHandler("secret")}>Secret</button>
      <div>
        <h1>{error}</h1>
        <ul>
          <li>
          </li>
        </ul>
      </div>
    </>
  )
}

export default App
