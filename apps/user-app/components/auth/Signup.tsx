"use client"

import { Card } from "@repo/ui/card";
import { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signupFormSchema, SignupSchemaType } from "../../lib/schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import signUp from "../../lib/auth.actions";
import { PATHS } from "../../config/path.config";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/Form";
import { Input } from "../ui/FormInput"
import { EyeIcon, EyeOffIcon } from "./Signin";
import { ButtonLoading } from '../custom/ButtonLoading';
import Link from "next/link";


export default function Signup() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<SignupSchemaType>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: '',
            email: '',
            number: '',
            password: '',
        }
    })

    async function formHandler(data: SignupSchemaType) {
        try {
            console.log("data", data);
            const result = await signUp(data);
            console.log("result-signup", result);

            if (!result.status) {
                toast({
                    variant: 'destructive',
                    title: "Something went wrong!! try again after sometime."
                })
            } else {
                toast({
                    variant: 'default',
                    title: "Signup succesful, Welcome!"
                })
                router.push(PATHS.HOME);
            }
        } catch {
            toast({
                variant: 'destructive',
                title: "Something went wrong !! try again after sometime."
            })
        }
    }

    const togglePassword = (e: React.MouseEvent) => {
        e.preventDefault()
        setPasswordVisible(!passwordVisible);
    }

    return (
        <div className="card bg-white p-6 rounded-lg shadow-sm border">
            <div className="card-header space-y-1.5 pb-6">
                <h3 className="font-semibold text-2xl text-center">Sign up</h3>
                <p className="text-sm text-gray-500 text-center">Create a new account</p>
            </div>
            <div className="card-form">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(formHandler)}>
                        <div>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} placeholder='Enter your name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mt-4">
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} placeholder="Enter your email" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mt-4">
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type={passwordVisible ? 'text' : 'password'} {...field} placeholder="Create a password" />
                                        </FormControl>
                                        <button className="absolute right-2 top-8" onClick={togglePassword}>
                                            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </form>
                </Form>
            </div>

            <ButtonLoading
                className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white"
                type="submit"
                disabled={form.formState.isSubmitting}
                aria-label="submit"
            >
                {form.formState.isSubmitting ? 'Please wait' : 'Sign Up'}
            </ButtonLoading>
            <div className="text-center text-sm mt-4">
                <div className="space-x-1">
                    <span className="text-gray-500">Already have an account?</span>
                    <Link className="text-blue-600 hover:underline" href="/signin">
                        Sign In
                    </Link>
                </div>
                <Link className="text-blue-600 hover:underline block mt-2" href="#">
                    Forgot Password
                </Link>
            </div>
        </div>
    )
}