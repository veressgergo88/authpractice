import { useEffect, useState } from 'react'
import { Secret, secretDataLoad } from '../api/api'

export const SecretComp = () => {
  const [apiData, setApiData] = useState<Secret[]>([])
  const [error, setError] = useState("")
  const listItems = apiData.map(data => 
  <li>
    <p>{data.Latitude}</p>
    <p>{data.Longitude}</p>
  </li>)

  const loadHandler = async () => {
    const response = await secretDataLoad("api/secret", "secret")
    if(!response.success){
      setError("No data!")
    }else{
      setApiData(response.data)
    }
  }

  useEffect(() => {
    loadHandler()
  },[])
  
  return (
    <>
      <ul>
        <li>
        <h1>{error}</h1>
          {listItems}
        </li>
      </ul>
    </>
  )
}