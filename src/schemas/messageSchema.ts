import {z} from "zod"

export const messageSchema = z.object({
    content:z
    .string()
    .min(10,{message:"content must be more than 10 character"})
    .max(300,{message:"content must not be not more than 300 character"})
})