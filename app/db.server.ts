import { MongoClient, ObjectId } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) throw new Error("The URL of Mongo is required.");

export const client = new MongoClient(MONGO_URL)

export async function connect() {
  await client.connect();
  return client.db("myFirstDatabase");
}

export { ObjectId };
