import { ApolloServer, gql, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import guid from "guid";
//require("dotenv").config();
import dotenv from 'dotenv'
dotenv.config();
console.log("process.env.MONGO_URL:", process.env.MONGO_URL);
import path from "path";

import { charge } from "./services/stripe.mjs";
import express from 'express';
import cors from 'cors';
//import { dbAuth, updateUser, getUserByEmail, getDonations, updateFromStripe } from "./dao/dao1.mjs";
import MainDAO from "./dao/DAOClass.js";
const dao = new MainDAO(process.env.MONGO_URL);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const refreshTokens = {};
let stripe_url;
const typeDefs = gql`
  type Query {
    profile: String!
    donations: String!
    logout: String!
  }

  type Mutation {
    authenticate(name: String!, password: String!): String
    refresh: String
    donate(amount: Float!): String
    reg(password1: String!, password2: String!, lastName: String!, firstName: String!, email: String!):String
  }
`;
let userName

const resolvers = {
  Query: {
    profile: async (_parent, _args, context) => {
      console.log("profile", context?.name);

      const user = await dao.getUserByEmail(context?.name);

      console.log("USER", user);
      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }
      const user2 = { username: user.username }
      return JSON.stringify(user);
    },
    donations: async (_parent, _args, context) => {
      console.log("profile", context?.name);

      const donations = await dao.getDonations(context?.name);

      console.log("donations", donations);


      return JSON.stringify(donations);
    },
    logout: (_parent, _args, context) => {
      console.log("logout");
      jwt.sign({ data: context?.name }, JWT_SECRET, { expiresIn: "1 s" });
      return "logged out";
    }
  },
  Mutation: {
    authenticate: async (
      _,
      { name, password }
    ) => {
      console.log("NAME:", name)
      const user = await dao.dbAuth(name, password);

      if (user && user.status === 1) {
        return jwt.sign({ data: name }, JWT_SECRET, { expiresIn: "7 days" });
      } else {
        return '{ data: { authenticate: "Failed login" } }';
      }
    },
    reg: async (
      _,
      { lastName, firstName, email, password1, password2 }
    ) => {
      console.log("NAME:", email)
      // updateUser = async (userId: string, password1: string, password2: string, lastName: string, firstName: string, email: string, roleId: string, status: string)
      const user = await dao.updateUser("", password1, password2, lastName, firstName, email, 1, 1);

      if (user && user?.status === 1) {
        return jwt.sign({ data: email }, JWT_SECRET, { expiresIn: "7 days" });
      } else {
        console.log("REG ERROR:", user.message);
        return `error: ${user.message}`;
      }
    },
    donate: async (_parent, { amount }) => {
      console.log("donate.amount", amount, userName);
      const resp = await charge(dao, userName, amount);
      console.log(resp);
      if (resp.status === 200) {
        console.log("redirect:", resp.url);
        stripe_url = resp.url;

        // GV_RESPONSE.redirect(resp.url);
        return `url: ${stripe_url}`
        // return app.response.redirect(resp.url);
      } else {
        return "message: payment failed";
      }

    },
    refresh: (
      _parent,
      _args,
      { refreshToken }
    ) => {
      const token = jwt.verify(refreshToken, JWT_SECRET);
      if (token.data in refreshTokens) {
        return jwt.sign({ data: refreshTokens[token.data] }, JWT_SECRET, {
          expiresIn: "5s",
        });
      }
    },
  },
};
const app = express();
app.use(cors());
app.use(express.static('public'));
console.log("DIRNAME",path.resolve());
const GC_DIRNAME = path.resolve();
let GV_RESPONSE;
async function startServer() {
  const server = new ApolloServer({
    formatResponse: (response, requestContext) => {
      console.log("formatResponse")
      if (response.errors && !requestContext.request.variables?.password) {
        if (requestContext.response?.http) {
          requestContext.response.http.status = 401;
        }
      } else if (response.data?.authenticate || response.data?.refresh) {
        const tokenExpireDate = new Date();
        tokenExpireDate.setDate(
          tokenExpireDate.getDate() + 60 * 60 * 24 * 7 // 7 days
        );
        const refreshTokenGuid = guid.raw();

        const token = jwt.verify(
          response.data?.authenticate || response.data?.refresh,
          JWT_SECRET
        );

        refreshTokens[refreshTokenGuid] = token.data;
        const refreshToken = jwt.sign({ data: refreshTokenGuid }, JWT_SECRET, {
          expiresIn: "7 days",
        });

        requestContext.response?.http?.headers.append(
          "Set-Cookie",
          `refreshToken=${refreshToken}; expires=${tokenExpireDate}`
        );
      }
      console.log("response", response, stripe_url)
      if (stripe_url) {
        //this.context.res.redirect(stripe_url);
        response.http?.headers.set("location", stripe_url);
      }
      return response;
    },
    context: ({ req, res }) => {
      const ctx = {
        name: null,
        refreshToken: null,
        res: null
      };
      console.log("context");
      // GV_RESPONSE = res;
      const cookies = (req.headers?.cookie ?? "")
        .split(";")
        .reduce((obj, c) => {
          console.log("COOKIE:", c);
          if (c.indexOf("=") > 0) {
            const [name, value] = c.split("=");
            obj[name.trim()] = value.trim();
          }
          return obj;
        }, {});

      ctx.refreshToken = cookies?.refreshToken;
      console.log("ctx.refreshToken", ctx.refreshToken);
      try {
        if (req.headers["x-access-token"]) {
          console.log("req.headers", req.headers["x-access-token"])
          const token = jwt.verify(
            req.headers["x-access-token"],
            JWT_SECRET
          );
          console.log("TOKEN", token);
          ctx.name = token.data;
          ctx.res = res;
          userName = ctx.name;
        }
      } catch (e) {
        console.log("JWT ERROR ", e);
      }
      return ctx;
    },
    typeDefs,
    resolvers,
  });
  await server.start();
  server.applyMiddleware({ app });

  app.get("/success/:id/:token", async (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    const t = await dao.updateFromStripe(id, 1);
    const msg = `<h1>Thank you for your donation to Save the Elephants<br/>Your Confirmation number is ${id}</h1>`

    const resp = { status: "success", id: id, token: token }
   // res.send(msg);
    res.sendFile(path.join(GC_DIRNAME+'/public/payment.html'));

    //res.sendFile(path.resolve(__dirname, "client", "build", "payment.html"));
  });
  app.get("/failure/:id/:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    dao.updateFromStripe(id, -1);
    const msg = `<h1>Your payment failed, reference # ${id}</h1>`
    const resp = { status: "failed", id: id, token: token }
    res.send(msg);
  });
  const GC_RELEASE = "2023-07-12";
  app.get("/release", (req, res) => {
    res.send({ release: GC_RELEASE, path: GC_DIRNAME });
  })
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`🚀  server ready at ${PORT}`);
  });
}
startServer();
/*
server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`🚀  server ready at ${url}`);
});
*/
