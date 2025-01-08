import { MongoClient, Db } from "mongodb";

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

    public async createCollection (collectionName : string , options : object) : Promise<void> {
        try {

            const db = DBInstance.db
            const existingCollections = await db.listCollections({ name: collectionName }).toArray();
            if (existingCollections.length > 0) {
                console.log(`Collection '${collectionName}' already exists.`);
                return;
            }

            await db.createCollection(collectionName, options);
            console.log(`Collection ${collectionName} created`)

        } catch (error) {
            console.log(error)
        }
    }

    public async checkUserAlreadyExists(email : string) {
        try {
            const db = this.getDb();
            const user = await db.collection("users").findOne({email});
            return user ? true : false;
        } catch (error) {
            console.log(error);
        }
       
    }

    public async createUser (firstName : string, lastName : string, email : string, password : string) {
        try {
            const db = this.getDb();
            const user = await db.collection("users").insertOne({firstName : firstName, lastName : lastName, email : email, password : password});
            return user.insertedId.toString();
        } catch (error) {
            console.log(error);
        }
    }

    public async getUser (email : string) {
        try {
            const user = await DBInstance.db.collection("users").findOne({email});
            return user;
        } catch (error) {
            console.log(error);
        }
    }
}
