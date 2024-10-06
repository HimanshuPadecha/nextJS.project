"use client"
import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from 'next/link'
import axios, { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useDebounceCallback } from "usehooks-ts"
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { signupSchema } from '@/schemas/signupSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from "lucide-react"

function Signup() {

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [ischeckingUsername, setIscheckingUsername] = useState(false)
    const [loading, setLoading] = useState(false)
    const debounce = useDebounceCallback(setUsername, 300)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })

    useEffect(() => {

        const checkUsername = async () => {
            if (username) {
                setIscheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username')
                } finally {
                    setIscheckingUsername(false)
                }
            }
        }
        checkUsername()
    }, [username])

    const onSubmit = async (data: z.infer<typeof signupSchema>) => {
        setLoading(true)
        try {
            const response = await axios.post<ApiResponse>("/api/sign-up", data)
            toast({
                title: "success",
                description: response.data.message
            })
            router.replace(`/verify/${username}`)
        } catch (error) {
            console.log("error in sign up", error);
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: "signup failed",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-800'>
            <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter username" {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounce(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    {ischeckingUsername && <Loader2 className='animate-spin'/>}
                                    <p className={`${usernameMessage === "username is unique" ? "text-green-500": "text-red-500" } text-sm`}>
                                        {usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter email" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder="Enter password" {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit' disabled={loading}>
                            {loading ?
                                <>
                                    <Loader2 className='mr-2 h-4 animate-spin' /> Please wait
                                </> : "Sign up"}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup