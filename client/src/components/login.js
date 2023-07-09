import React, { useState, useEffect } from "react";
import HTTPRequest from "../services/HTTPRequest";
import {
    Link
} from 'react-router-dom';
const Login = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    useEffect(() => {
        init();
    }, []);

    const init = () => {
        //const token = sessionStorage.removeItem("SERVER_API_TOKEN");
        console.log("login");
    }
    const usernameHandler = (e) => {
        setUsername(e.target.value);
    };
    const passwordHandler = (e) => {
        setPassword(e.target.value);
    };
    const donate = async () => {
        console.log("donate");
    }
    const login = async () => {
        const un = username;
        const pw = password;

        const token = await HTTPRequest.auth(un, pw);
        if (token !== null) {
            console.log("responseData.token", token)
            setToken(token, "/");
        }
        else {
            setMessage("Invalid Login");
        }

    }


    return (
        <div>
            <p><input type="text" name="username" id="username" value={username} onChange={usernameHandler} placeholder="user name" /></p>
            <p><input type="password" name="password" id="password" value={password} onChange={passwordHandler} placeholder="password" /></p>
            <p><button onClick={login}>Login</button></p>
            <p>{message}</p>
            <p><Link to="/reg">Register</Link></p>
        </div>)
}
export default Login;