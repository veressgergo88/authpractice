import { useEffect, useMemo, useState } from "react"
import { getMessages, postMessage } from "../api"
import { type Message } from "../api"

type ChatProps = {
    loggedInUser: string
}

export const Chat = (props:ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState("")
    const presentedMessages = useMemo(() => { return [...messages].reverse() }, [messages])
    
    const sendMessage = async () => {
        const response = await postMessage(message)
        if (!response.success)
            return alert(`Could not post message ${response.status}`)

        setMessages([...messages, response.data])
        setMessage("")
    }

    const fetchData = async () => {
        const response = await getMessages()
        if (!response.success) {
            return alert(`Could not load messages ${response.status}`)
        } 
        setMessages(response.data)
    }


    useEffect(() => {
        fetchData()
    }, [])
    

    return(
        <>
        <section className="max-w-[800px] m-auto">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="textarea m-auto block mt-10 bg-base-300 w-[60%]" placeholder="Say something" rows={3}></textarea>
            <button onClick={sendMessage} className="btn btn-info m-auto w-[60%] block mt-2 mb-6">Send</button>
            {presentedMessages.map((presentedMessage) => 
                <div key={presentedMessage.id} className={props.loggedInUser === presentedMessage.email ? 'alert-info' : "'', 'alert my-4'"}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{presentedMessage.content} ({presentedMessage.email})</span>
                </div>
            )}
        </section>
        </>
    )
}