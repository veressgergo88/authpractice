import { useState } from 'react'
import { PublicComp } from './components/PublicComp'
import { SecretComp } from './components/SecretComp'
import './App.css'

function App() {
  const [isPublic, setIsPublic] = useState(false)
  const [isSecret, setIsSecret] = useState(false)
    
  const buttonHandler = async (type: string) => {
    if(type === "secret"){
      setIsSecret(true)
      setIsPublic(false)
    }else {
      setIsPublic(true)
      setIsSecret(false)
    }
  }
  
  return (
    <>
      <div>
        <button onClick={() => buttonHandler("public")}>Public</button>
        {isPublic && <PublicComp/>}
      </div>
      <div>
        <button onClick={() => buttonHandler("secret")}>Secret</button>
        {isSecret && <SecretComp/>}
      </div>
    </>
  )
}

export default App
