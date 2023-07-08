import React, { useState } from "react";
import { server } from '../services/server';

const Donate = (token) => {
    const [amount, setAmount] = useState(0);

    const amountHandler = (e) => {
        setAmount(e.target.value);
        console.log("setAmount", e.target.value);
    };

    const donate = async () => {

        //const amount = prompt("Amount: ");
        const q = `mutation{
                donate(amount: ${amount})
            }`
        console.log("Q:", q)
        const response = await server(q, token);
        
        const responseText = await response.text();
        console.log("responseText", responseText);
        const url = responseText.split("url:")[1].split('"}}')[0];
        const responseData = JSON.parse(responseText);
        window.open(url);
        // const s = JSON.parse(responseData.data.donate);
        console.log("responseData", url, responseData.data.donate)
    }

    return (
        <div>
            <p><input type="text" name="amount" id="amount" value={amount} onChange={amountHandler} placeholder="donation amount" /></p>
            <p><button onClick={donate}>Donate</button></p>
        </div>)
}
export default Donate;