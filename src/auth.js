
const jwt = require('jsonwebtoken');
const { dbAuth } = require("./dao/dao");
const refreshTokens = [];
function auth(refreshToken) {
    if (refreshToken == null) return { status: 401 }
    if (!refreshTokens.includes(refreshToken)) return { status: 403 }
    console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return { status: 403 }
        const accessToken = generateAccessToken({ name: user.name })
        return { status: 200, accessToken: accessToken, user: user }
    })
    return { status: 201 }
}

function logout(serverToken) {
    refreshTokens = refreshTokens.filter(token => token !== serverToken)
    return { status: 204 }
}

async function login(username, password, ctx) {
    // Authenticate User
    console.log("auth.login", username, password);
    const user = await dbAuth(username, password);
    //console.log("after", user);
    if (user.status !== 1) {
        return [{ message: user.message, status: user.status, id: 0, level: 0 }];
    }
    // console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken({ name: user.name });
    console.log("accessToken", accessToken)
    const secret = process.env.REFRESH_TOKEN_SECRET;

    const refreshToken = jwt.sign({ name: user.name }, process.env.REFRESH_TOKEN_SECRET)
    console.log("refreshToken", refreshToken)
    ctx['username'] = user.name;
    const token = { token: refreshToken, username: user.name, userId: user.userId }
    refreshTokens.push(token)
    //return refreshToken;
    return [{ message: "auth: " + refreshToken, status: 1, id: 1, level: 1 }];
}
function getUserByToken(token) {
    for (let t of refreshTokens) {
        console.log("getUserByToken:", token, " = ", t.token);
        if (t.token === token) {
            return t;
        }
    }
    return null;
}
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}
function getRefreshTokens() {
    return refreshTokens;
}
module.exports = { auth, logout, login, getRefreshTokens, getUserByToken }