import {z} from "zod"

export const usernameValidation = z
    .string()
    .min(2,"Username must be atleast 2 character")
    .max(20,"Username must not be more than 20 character")
    .regex(/^[a-zA-Z0-9]+$/,"Username must not be contain special character")

export const signupSchema = z.object({
    username :usernameValidation,
    email: z.string().email({message:"Invalid email address"}),
    password:z.string().min(6,{message:"password must me atleast six character"})
})
