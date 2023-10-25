import { useState } from "react";
import { login } from "../api";

type LoginProps = {
    feLogin: () => void
}

export const Login = (props: LoginProps) => {
    const [email, getEmail] = useState("")
    const [password, getPassword] = useState("")

    const handleLogin = async () => {
        const result = await login(email, password)
        if (result.success)
            props.feLogin()
        else
            alert(`Sikertelen Login $result.status`)
    }

    return (
        <section className="card w-[320px] m-auto mt-10 bg-base-300 text-primary p-6">
            <h1 className="card-title">Login</h1>
            <div className="flex flex-col gap-4 py-4">
                <input className="input" placeholder="Email" type="text" value={email} onChange={(e) => getEmail(e.target.value)}/>
                <input className="input" placeholder="Password" type="text" value={password} onChange={(e) => getPassword(e.target.value)}/>
            </div>
            <div className="card-actions justify-end">
                <button className="btn btn-success" onClick={handleLogin}>Login</button>
            </div>
        </section>
    )
}