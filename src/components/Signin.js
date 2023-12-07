import React, {useState, useSyncExternalStore} from "react";
import {SigninWithEmailAndPassword} from "firebase/auth";
import auth from "../firebase"
const Signin =()=> {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const login= (e)=>{
        e.preventDefault();
        SigninWithEmailAndPassword(auth, email,password)
        .then((useCredential)=>{
            console.log(useCredential)
        })
        .catch((error)=>{
            console.log(error)
        });


    }
    return(
        <div>
            <form>
                <input type='email' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="'Enter email"> </input>
                <input placeholder="password" value={password} onChange={(e)=>setEmail(e.target.value)}> </input>
                <button type="submit">Log In</button>
            </form>
        </div>
    )
}