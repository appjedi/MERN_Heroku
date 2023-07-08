import mongoose from 'mongoose';

const url = getConnURL();
console.log("MONGO URL", url);
mongoose.connect(url ? url : "");
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    email: { type: String, required: true },
    password: String,
    lastName: String,
    firstName: String,
    status: Number,
    roleid: Number,
    donations: Array
}, { collection: 'users' });
var UserData = mongoose.model('UserData', userDataSchema);
const donationSchema = new Schema({
    id: String,
    userId: String,
    email: String,
    amount: Number,
    status: Number,
    paid: String,
    posted: String
}, { collection: 'donations' });
const DonationData = mongoose.model('DonationData', donationSchema);

function getConnURL() {
    return process.env.MONGO_URL || "mongodb://localhost:27017/FauziaA";
}
const updateFromStripe = async (id, status) => {
    const paid = new Date().getTime()
    await DonationData.findOneAndUpdate({ id: id }, { status: status, paid:  paid});

    console.log("updateFromStripe.ID:", id);
}
const updateUser = async (userId, password1, password2, lastName, firstName, email, roleId, status) => {
    try {
        const user = {
            email: email,
            password: password1,
            lastName: lastName,
            firstName: firstName,
            roleId: roleId,
            status: status
        }
        const resp = await UserData.create(user);
        return user;
    } catch (e) {
        console.log(e);
        return { status: -1 };
    }
    return { status: -1 };;
}
const getDonations = async (email) => {
    const donations = await DonationData.find({ email: email })
    console.log("getDonations", donations);
    return donations;
}
const addDonation = async (email, amount) => {
    try {
        const user = await getUserByEmail(email);
        console.log("addDonation.user:", email, user);
        const userId = (user ? user.userId : "");

        const id = new Date().getTime();
        const donation = {
            id: id,
            userId: userId,
            email: email,
            amount: amount,
            status: 0,
            posted: new Date(),
            paid: null
        }

        console.log("donation:", donation)
        // user.donations.push({ id: id, amount: amount, status: 0, paid: "" });
        const resp = await DonationData.create(donation);
        console.log("addDonation.RESP:", resp);
        const donations = await getDonations(email);
        await UserData.findOneAndUpdate({ email: email }, { donations: donations });
        return id;
    } catch (e) {
        console.log(e);
        return -1;
    }
    return 1;
}
const getUsers = async (id) => {
    const data = await UserData.find({});
    //const donations = data ? data.donations : [];
    const users = [];
    for (let u of data) {
        console.log("U:", u);
        const user = { userId: u._id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1, donations: u.donations }
        users.push(user);
    }
    return users;
}
const getUserById = async (id) => {
    const user = await UserData.findById(id);
    if (user) {
        return user;
    } else {
        null;
    }
}
const getUserByEmail = async (email) => {

    const data = await UserData.find({ email: email });
    if (data) {
        const u = data[0];
        const id = u._id.toString()
        const user = { userId: id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1, donations: u.donations }
        return user;
    } else {
        const user = { userId: "NF", username: email, lastName: "", firstName: "", email: "", password: "", roleId: 0, status: 0, donations: [] }
    }
}
const dbAuth = async (username, password) => {
    const data = await UserData.find({ email: username });
    if (!data) {
        return { status: -1, message: "Not Found" }
    }
    if (data[0].password !== password) {
        return { status: -2, message: "Invalid password" }
    }
    const user = { name: data[0].email, status: 1, message: "Authenticated", userId: data[0]._id };
    return user;

}
export {dbAuth, updateUser, getUsers,  addDonation, getUserByEmail, getDonations, updateFromStripe };