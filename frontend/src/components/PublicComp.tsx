import { useEffect, useState } from 'react'
import { Public, publicDataLoad } from '../api/api'

export const PublicComp = () => {
  const [apiData, setApiData] = useState<Public[]>([])
  const [error, setError] = useState("")
  const listItems = apiData.map(data => <li>{data.message}</li>)

  const loadHandler = async () => {
    const response = await publicDataLoad("api/public", "public")
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
