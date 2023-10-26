import { useEffect, useState } from "react"
import { getMessages, postMessage } from "../api"
import { type Message } from "../api"

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState("")
    const [presentedMessages, setPresentedMessages] = useState<Message[]>([])
    
    const sendMessage = async () => {
        const response = await postMessage(message)
        if (!response.success)
            return alert(`Could not post message ${response.status}`)

        setMessages([...messages, response.data])
        setMessage("")
    }

    useEffect(() => {
        setPresentedMessages([...messages].reverse())
    }, [messages]) 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getMessages()
                if (!response.success){
                    return alert(`Could not load messages ${response.status}`)
                } else {
                    setMessages(response.data)
                }
            } catch (error) {
                console.error("Error loading messages:", error)
            }
        }
        fetchData()
    },[])

    return(
        <>
        <section className="max-w-[800px] m-auto">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="textarea m-auto block mt-10 bg-base-300 w-[60%]" placeholder="Say something" rows={3}></textarea>
            <button onClick={sendMessage} className="btn btn-info m-auto w-[60%] block mt-2 mb-6">Send</button>
            {presentedMessages.map((presentedMessage) => 
                <div className="alert my-4" key={presentedMessage.id}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{presentedMessage.content} {presentedMessage.email}</span>
                </div>
            )}
        </section>
        </>
    )
}