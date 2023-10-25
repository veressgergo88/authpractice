import { useState } from "react";
import { signup } from "../api";

export const Signup = () => {
    const [email, getEmail] = useState("")
    const [password, getPassword] = useState("")

    const handleSignup = async () => {
        const result = await signup(email, password)
        if (result.success)
            alert("Sikeres reg")
        else
            alert(`Sikertelen reg $result.status`)
    }

    return (
        <section className="card w-[320px] m-auto mt-10 bg-base-300 text-primary p-6">
            <h1 className="card-title">Signup</h1>
            <div className="flex flex-col gap-4 py-4">
                <input className="input" placeholder="Email" type="text" value={email} onChange={(e) => getEmail(e.target.value)}/>
                <input className="input" placeholder="Password" type="text" value={password} onChange={(e) => getPassword(e.target.value)}/>
            </div>
            <div className="card-actions justify-end">
                <button className="btn btn-success" onClick={handleSignup}>Signup</button>
            </div>
        </section>
    )
}