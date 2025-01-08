import mongoose from "mongoose";

class Database {
    connection = mongoose.connection;
    constructor() {
        try {
            this.connection
                .on('open', console.info.bind(console, 'Database connection: open'))
                .on('close', console.info.bind(console, 'Database connection: close'))
                .on('disconnected', console.info.bind(console, 'Database connection: disconnecting'))
                .on('reconnected', console.info.bind(console, 'Database connection: reconnected'))
                .on('fullsetup', console.info.bind(console, 'Database connection: fullsetup'))
                .on('all', console.info.bind(console, 'Database connection: all'))
                .on('error', console.error.bind(console, 'MongoDB connection: error:'));
        } catch (error) {
            console.error(error);
        }
    }

    async connect(username: string, password: string, dbname: string) {
        try {
            await mongoose.connect(
                `mongodb+srv://${username}:${password}@cluster0.2a7nn.mongodb.net/${dbname}?retryWrites=true&w=majority`,
            );
        } catch (error) {
            console.error(error);
        }
    }

    async close() {
        try {
            await this.connection.close();
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = new Database();