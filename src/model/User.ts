import mongoose,{Schema, Document} from "mongoose"

export interface Message extends Document{
    content:string,
    createdAt:Date
}

const MessageSchema:Schema<Message> = new Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    }
})

export interface User extends Document{
    email:string,
    password:string,
    verifyCode:string,
    verifyCodeExpiry:Date,
    isAcceptingMessage:boolean,
    messages:Message[],
    username:string,
    isVerified:boolean
}

const userSchema:Schema<User> = new Schema({
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        ,"Please use a valid email address"]
    },
    username:{
        type:String,
        required:[true,"username is required"],
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    verifyCode:{
        type:String,
        required:[true,"verifycode is required"]
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true,"verifycodeExpiry is required"]
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAcceptingMessage:{
        type:Boolean,
        default:true
    },
    messages:[MessageSchema]
}) 


const UserModel = (mongoose.models.User as mongoose.Model<User>) || (
    mongoose.model<User>("User",userSchema)
)

export default UserModel
