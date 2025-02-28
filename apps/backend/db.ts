import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING || "mongodb://localhost:27017/default_db";
let dbInstance: Db | null = null;

export async function connectDB(): Promise<Db> {
    console.log(MONGO_URI,"MONGO_URI")
    if (!dbInstance) {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log("✅ MongoDB подключен!");
        dbInstance = client.db();
    }
    return dbInstance;
}