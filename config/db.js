import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({path: '.env'});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URI_MONGO, {});
        console.log('Connected Db !!!');
    } catch (error) {
        console.log('Db not connected !!!');
        console.log(error);
        process.exit(1); // 1 es termina, 0 es continua
    }
}

export default connectDB;