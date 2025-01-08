import { MongoClient, Db, ObjectId, Double } from "mongodb";
import bcrypt from "bcrypt"

export class DBInstance {
    private static instance: DBInstance;
    private static db: Db;
    private MONGODB_URI: string = process.env.MONGODB_URI!;
    private MONGODB_NAME: string = process.env.MONGODB_NAME!;
    private MongoDBClient: MongoClient;

    private constructor() {
        console.log("New MongoClient Instance Created");
        this.MongoDBClient = new MongoClient(this.MONGODB_URI);
    }

    private async initialize() {
        try {
            const connClient = await this.MongoDBClient.connect();
            DBInstance.db = connClient.db(this.MONGODB_NAME);
            console.log("Connected to", this.MONGODB_NAME);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }

    public static getInstance = async (): Promise<DBInstance> => {
        if (!DBInstance.instance) {
            DBInstance.instance = new DBInstance();
            await DBInstance.instance.initialize();
        }
        return DBInstance.instance;
    };

    public getDb(): Db {
        if (!DBInstance.db) {
            throw new Error("Database not initialized. Ensure `getInstance` is called.");
        }
        return DBInstance.db;
    }

    public async createCollection(collectionName: string, options: object): Promise<void> {
        try {

            const db = DBInstance.db
            const existingCollections = await db.listCollections({ name: collectionName }).toArray();
            if (existingCollections.length > 0) {
                return;
            }
            await db.createCollection(collectionName, options);
        } catch (error) {
            console.log(error)
        }
    }

    public async checkUserAlreadyExists(email: string) {
        try {
            const db = this.getDb();
            const user = await db.collection("users").findOne({ email });
            return user ? true : false;
        } catch (error) {
            console.log(error);
        }

    }

    public async createUser(firstName: string, lastName: string, email: string, password: string) {
        try {
            const db = this.getDb();
            const user = await db.collection("users").insertOne({ firstName: firstName, lastName: lastName, email: email, password: password });
            return user.insertedId.toString();
        } catch (error) {
            console.log(error);
        }
    }

    public async createAccount(userId: string): Promise<void> {
        try {
            await DBInstance.db.collection("accounts").insertOne({
                userId : new ObjectId(userId),
                balance : 1000.0
            });
        } catch (error : any) {
            console.error(error.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied[0]);
        }
    }

    public async getUser(identifier: string) {
        try {
            const user = await DBInstance.db.collection("users").findOne({
                $or: [
                    { email: identifier }
                ],

            }, {
                projection: { _id: 1, firstName: 1, lastName: 1 }
            });
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllUsers(identifier: string) {
        try {
            if (!identifier) {
                const users = DBInstance.db.collection("users").find({}, { projection: { _id: 1, firstName: 1, lastName: 1, email: 1 } }).toArray();
                return users;
            }
            const users = DBInstance.db.collection("users").find({ $or: [{ firstName: { $regex: identifier } }, { lastName: { $regex: identifier } }] }, { projection: { _id: 1, firstName: 1, lastName: 1, email: 1 } }).toArray()
            return users;
        } catch (error) {
            console.log(error);
        }
    }

    public async getBalance (userId : string) {
        try {
            const account = await DBInstance.db.collection("accounts").findOne({"userId": new ObjectId(userId)}, {projection: {balance : 1}});
            return account!.balance;
        } catch (error) {
            console.log(error);
        }
    }

    public async updateUser(userId: string, password: string | null, firstName: string | null, lastName: string | null) {
        try {
            const updateData: any = {};
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword
            }
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;

            console.log(userId);
            if (Object.keys(updateData).length > 0) {
                const res = await DBInstance.db.collection("users").updateOne(
                    { "_id": new ObjectId(userId) },
                    { $set: updateData }
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}
