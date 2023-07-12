import React, { useState } from "react";

import Helper from '../services/helper';
const Donations = ({ donations }) => {
    const statusLabels = ['pending', 'paid']
    const donationsList = donations.map((row) =>
        <tr key={row.id}>
            <td>{Helper.nicedate(row.id)}</td><td>${row.amount}</td><td>{statusLabels[row.status]}</td>
        </tr>
    );
    if (donations.length < 1) {
        return <div />
    }
    return (
        <div>
            <table border='1'><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>{donationsList}</tbody></table>
        </div>
    )
}
export default Donations;