import mongoose from "mongoose"

type ConnectionObject = {
    isConnected?:number
}


const connection:ConnectionObject = {}

async function dbConnect():Promise<void>{

    if(connection.isConnected){
        console.log("Database is already connected");
        return
    }

    try {
        const db = await mongoose.connect(`${process.env.MONGO_URL}/mystryMessages` || "" , {})

        connection.isConnected = db.connections[0].readyState

        console.log("db connected successfully");
        
    } catch (error) {
        console.log("Database connection is failed",error);
        
        process.exit(1)

    }
}

export default dbConnect