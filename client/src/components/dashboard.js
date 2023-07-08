import React, { useState, useEffect } from "react";
//import { getProfile, donate, getDonations, nicedate } from '../services/server';
import HTTPRequest from "../services/HTTPRequest";
import Helper from '../services/helper';
import {
    Link
} from 'react-router-dom';
const Dashboard = ({ token, setToken }) => {
    const [amount, setAmount] = useState(0);
    const [profile, setProfile] = useState({ lastName: "", firstName: "" });
    const [donations, setDonations] = useState([]);
    useEffect(() => {
        init();
    }, []);
    const init = async () => {
        const profile = await HTTPRequest.getProfile();
        setProfile(profile);

        const donations = await HTTPRequest.getDonations();
        setDonations(donations);
    }
    const amountHandler = (e) => {
        setAmount(e.target.value);
        console.log("setAmount", e.target.value);
    };
    const donateHandler = async () => {
        const url = await HTTPRequest.donate(amount);
        window.open(url);
        const d = await HTTPRequest.getDonations();
        setDonations(d);
    }
    const logout = async () => {
        console.log("DB.LOGOUT");

        const resp = await HTTPRequest.logout();
        console.log("RESP:", resp)
        setToken("");
    }
    const donationsList = donations.map((row) =>
        <tr key={row.id}>
            <td>${row.amount}</td><td>{Helper.nicedate(row.id)}</td><td>${row.status}</td>
        </tr>
    );

    return (
        <div>
            <div>

                <p><button onClick={logout}>Logout</button></p>

            </div>
            <h1>Welcome {profile.firstName}</h1>
            <p><input type="text" name="amount" id="amount" value={amount} onChange={amountHandler} placeholder="donation amount" />
                <button onClick={donateHandler}>Donate</button></p>
            <p>
                {donations ? <table border='1'><thead><tr><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{donationsList}</tbody></table> : ""
                }
            </p>
        </div>
    )
}
export default Dashboard;