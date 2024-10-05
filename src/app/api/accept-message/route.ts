import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth"

export async function POST(request:Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user : User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"not authenticated"
        },{status:401})
    }

    const userId = user._id

    const {acceptMessage} = await request.json()


    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            {isAcceptingMessage:acceptMessage},{new:true}
        )

        if(!updatedUser){
            return Response.json({
                success:false,
                message:"failed to update the user accepting messages"
            },{status:401})
        }

        return Response.json({
            success:true,
            message:"status updated successfully"
        },{status:200})

    } catch (error) {
        console.log("error while updating status",error);
        
        return Response.json({
            success:false,
            message:"error while updating status"
        },{status:500})
    }
}

export async function GET(request:Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user : User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"not authenticated"
        },{status:401})
    }

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
    
        if(!foundUser){
            return Response.json({
                success:false,
                message:"failed to find user"
            },{status:404})
        }
    
        return Response.json({
            success:true,
            message:"stauts fetched successfully",
            isAcceptingMessage:foundUser.isAcceptingMessage
        },{status:404})
    } catch (error) {

        console.log("error while getting status",error);
        
        return Response.json({
            success:false,
            message:"error while getting status"
        },{status:500})
    }
}
