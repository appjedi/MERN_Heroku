
const { addDonation } = require("../dao/dao1.mjs");
//import Stripe from 'stripe';

//const stripe (process.env.STRIPE_PRIVATE_KEY);
const charge = async (email, amount) => {
    try {
        //const stripe =new Stripe(process.env.STRIPE_PRIVATE_KEY);
        const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

        console.log("STRIPE_PRIVATE_KEY", process.env.STRIPE_PRIVATE_KEY);
        const description = "Donation"
        const test = [{
            "price_data": {
                "currency": "usd", "product_data":
                    { "name": description },
                "unit_amount": amount * 100
            },
            "quantity": 1
        }];


        const dt = new Date();
        const id = dt.getTime();

        const donationId = await addDonation(email, amount);

        const lineItems = [
            {
                price_data: { currency: 'usd', product_data: { name: "donation" }, unit_amount: amount * 100 },
                quantity: 1
            }
        ];
        const url = `${process.env.CLIENT_URL}/success/${id}/2023`;
        console.log("URL:", url);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            client_reference_id: id,
            success_url: `${process.env.CLIENT_URL}/success/${id}/2023`,
            cancel_url: `${process.env.CLIENT_URL}/cancel/${id}/2023`,
        })
        return { status: 200, url: session.url };
    } catch (e) {
        console.log(e);
        return { status: -1, error: "Error" };
    }
}
export { charge }