import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod"
import { usernameValidation } from "@/schemas/signupSchema";

const userNameQuerySchema = z.object({
    username:usernameValidation
})

export async function GET(request:Request){
    await dbConnect()

    try {
        
        const {searchParams} = new URL(request.url)
        const queryParams = {
            username:searchParams.get('username')
        }

        const result = userNameQuerySchema.safeParse(queryParams)
        console.log(result);
        
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            console.log(usernameErrors);
            
            return Response.json({
                success:false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters"
            },{status:405})
        }

        const {username} = result.data

        const existingUser = await UserModel.findOne({username,isVerified:true})

        if(existingUser){
            return Response.json({
                success:false,
                message:"username is taken"
            },{status:400})
        }

        return Response.json({
            success:true,
            message:"username is unique"
        },{status:500})

    } catch (error) {
        console.error("error checking username: ",error)
        return Response.json({
            success:false,
            message:"error checking username"
        },{status:500})
    }
}

