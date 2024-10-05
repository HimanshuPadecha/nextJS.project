import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod"
import { verifySchema } from "@/schemas/verifySchema";

const verifyCodeSchema = z.object({
    verifyCode:verifySchema
})

export async function GET(request:Request){
    await dbConnect()

    const {username,verifyCode} = await request.json()

   try {
     const fromRequestVerifyCode = {
         verifyCode
     }
 
     const result = verifyCodeSchema.safeParse(fromRequestVerifyCode)
 
     if(!result.success){
         const verifyCodeErrors = result.error.format().verifyCode?._errors || []
 
         return Response.json({
             success:false,
             message:verifyCodeErrors?.length > 0 ? verifyCodeErrors?.join(', '): "Invalid verification code"
         })
     }

     const decodedUsername = decodeURIComponent(username)

     const user =await UserModel.findOne({username:decodedUsername})

     if(!user){
        return Response.json({
            success:false,
            message:"No user with this username exist"
        },{status:404})
     }

     const isValidCode = user.verifyCode === verifyCode

     const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

     if(isValidCode && isCodeNotExpired){
        user.isVerified = true
        await user.save()
        return Response.json({
            success:true,
            message:"code was correct"
        },{status:200})
     }
     if(!isValidCode){
        return Response.json({
            success:true,
            message:"Invalid code"
        },{status:404})
     }

     if(!isCodeNotExpired){
        return Response.json({
            success:true,
            message:"code is expired please sign in again"
        },{status:404})
     }
   } catch (error) {
    console.log("Error while checking code : ", error);

    return Response.json({
        success:false,
        message:"error while verifing code"
    },{status:500})
    
   }
}
