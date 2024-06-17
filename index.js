import connectDB from "./config/db.js";
import {ApolloServer} from "apollo-server";
import jwt from 'jsonwebtoken';
import typeDefs from "./db/schema.js";
import resolvers from "./db/resolver.js";

connectDB().then(() => console.log("Database Connected!!!"),
    () => console.log("Database failed to connect!!!"));

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context:({req})=>{
        const token = req.headers['authorization'] || '';
        if(token){
            try{
                const user = jwt.verify(token, process.env.SECRET);
                return {
                    user
                }
            } catch (e){
                console.log('Error al verificar token');
                console.log(e);
            }
        }
    }
});

server.listen().then(url => {
    console.log(`Servidor listo en la URL: ${url.url}`);
})