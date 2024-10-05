import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {Message} from "@/model/User"

export async function POST(request:Request) {
    await dbConnect()

    const {username,content} = await request.json()

    try {
        const user = await UserModel.findOne(username)

        if(!user){
            return Response.json({
                success:false,
                message:"user not found"
            },{status:401})
        }

        if(!user.isAcceptingMessage){
            return Response.json({
                success:false,
                message:"User is not accepting messages"
            },{status:401})
        }

        const newMessage = {
            content,
            createdAt:new Date()
        }

        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json({
            success:true,
            message:"Message sent successfully"
        },{status:200})
    } catch (error) {
        console.log("error while sending message",error);
        
        return Response.json({
            success:false,
            message:"error while sending message"
        },{status:500})
    }
}