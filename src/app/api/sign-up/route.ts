import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {email,password,username} = await request.json()

        const verifiedUserWithUsername = await UserModel.findOne({
            username,
            isVerified:true
        })

        if(verifiedUserWithUsername){
            return Response.json({
                success:false,
                message:"This username is taken"
            },{status:405})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success:false,
                    message:"User already exist with this email"
                },{
                    status:400
                })
            }else{
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password = hashedPassword

                existingUserByEmail.verifyCode = verifyCode

                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

                await existingUserByEmail.save()
            }
        }else{
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const user = new UserModel({
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isAcceptingMessage:true,
                messages:[],
                username,
                isVerified:false
            })

            await user.save()
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:emailResponse.message
            },{
                status:500
            })
        }

        return Response.json({
            success:true,
            message:"User registerd successfully.. we sent you verification code"
        },{
            status:200
        })


    } catch (error) {
        console.error("Error while registing user",error)
        return Response.json({
            success:false,
            message:"Error registering user"
        },{
            status:500
        })
    }
}
