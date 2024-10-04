import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions : NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials:{
                email:{label:"email",type:"text"},
                password:{label:"password",type:"password"},
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()

                try {
                    const user = await UserModel.findOne({
                        $or:[{
                            email:credentials.identifier.email
                        },{
                            username:credentials.identifier.username
                        }]
                    })

                    if(!user){
                        throw new Error("User does not exist with this email")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)

                    if(!isPasswordCorrect){
                        throw new Error("Password is not correct")
                    }

                    return user
                } catch (error:any) {
                    throw new Error(error)
                }
            }
        })
    ],
    pages:{
        signIn:'/sign-in'
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,
    callbacks:{
        async session({session,token}){
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
        async jwt({token,user}){
            if(user){
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        }
    }
}