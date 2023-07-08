const url = 'http://localhost:4000/graphql';
let token=sessionStorage.getItem("SERVER_API_TOKEN");;
export function setToken(t) {
    token = t;
    console.log("setToken", t);
    sessionStorage.setItem("SERVER_API_TOKEN", t);
}
export function getToken() {
    token = sessionStorage.getItem("SERVER_API_TOKEN");
    return token;
}
export function getServerURL() { return url; }
export async function auth(username, password)
{
    const query = `mutation{
                authenticate(name:"${username}", password:"${password}")
            }`;
    const headers= {
                'Content-Type': 'application/json'
                
            }
    const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: query,
            }),
    });
    const responseText = await response.text();
    console.log("responseText", responseText);
    const responseData = JSON.parse(responseText);
    const token = responseData.data.authenticate;
    console.log("responseData.token", token)
    setToken(token)
    return token;
}
export async function server(query)
{
    token = sessionStorage.getItem("SERVER_API_TOKEN");
    const headers = token ?
        
             {
                'Content-Type': 'application/json',
                'x-access-token': `${token}`
            }
        :
        {
                'Content-Type': 'application/json'
                
        }
    
    console.log("HEADERS:", headers);
    const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: query,
            }),
    });
    return response;
}

export async function donate(amount)
{
     const q = `mutation{
                donate(amount: ${amount})
            }`
    console.log("Q:", q)
    const response = await server(q);

    const responseText = await response.text();
    console.log("responseText", responseText);
    const url = responseText.split("url:")[1].split('"}}')[0];
    const responseData = JSON.parse(responseText);
    return url;

}
export async function getProfile()
{
    const q = "query {profile }";

    console.log("Q:", q)
    const response = await server(q);

    const responseText = await response.text();
    console.log("responseText", responseText);
    const responseData = JSON.parse(responseText);
    //donations = JSON.parse(responseData.data)
    const profile = JSON.parse(responseData.data.profile);
    console.log("responseData", profile)
    return profile;
}
export async function getDonations(){
    const q = "query {donations }";
    console.log("getTodos.TOKEN:", q);
    const response = await server(q, token);
    const responseText = await response.text();
    console.log("responseText", responseText);
    const responseData = JSON.parse(responseText);
    const donations = JSON.parse(responseData.data.donations)
    console.log("responseData", donations)
    return donations;
}

export function nicedate(id) {
    const dt = new Date(parseInt(id));
    return dt.toUTCString()
}