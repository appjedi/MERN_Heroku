import React, { useState } from "react";
//import { server } from '../services/server';
import HTTPRequest from "../services/HTTPRequest";
const Register = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");

    const usernameHandler = (e) => {
        setUsername(e.target.value);
    };
    const lastNameHandler = (e) => {
        setLastName(e.target.value);
    };
    const firstNameHandler = (e) => {
        setFirstName(e.target.value);
    };
    const password1Handler = (e) => {
        setPassword1(e.target.value);
    };
    const password2Handler = (e) => {
        setPassword2(e.target.value);
    };
    const donate = async () => {
        console.log("donate");
    }
    const register = async () => {
        const un = username;
        const pw1 = password1;
        const pw2 = password1;
        const ln = lastName;
        const fn = firstName;
        //  lastName, firstName, email, password1, password2
        const query = `mutation{
                reg(lastName: "${ln}",firstName: "${fn}", email:"${un}", password1:"${pw1}", password2:"${pw2}")
            }`;

        console.log("Q:", query)
        const response = await HTTPRequest.server(query);


        const responseText = await response.text();
        console.log("responseText", responseText);
        const responseData = JSON.parse(responseText);
        const token = responseData.data.reg;
        console.log("responseData.token", token)
        HTTPRequest.setToken(token)
        setToken(token, "/");
    }
    return (
        <div>
            <p><input type="text" name="username" id="username" value={username} onChange={usernameHandler} placeholder="user name" /></p>
            <p><input type="text" name="lastName" id="lastName" value={lastName} onChange={lastNameHandler} placeholder="last name" /></p>
            <p><input type="text" name="firstName" id="firstName" value={firstName} onChange={firstNameHandler} placeholder="first name" /></p>
            <p><input type="password" name="password1" id="password1" value={password1} onChange={password1Handler} placeholder="password" /></p>
            <p><input type="password" name="password2" id="password2" value={password2} onChange={password2Handler} placeholder="password" /></p>
            <p><button onClick={register}>Register</button></p>

        </div>)
}
export default Register;