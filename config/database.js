import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_CONN, {

        });

        console.log(`MonogDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`ERROR connectiong to monogDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;