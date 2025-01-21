"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonLoading } from '../custom/ButtonLoading';
import { Input } from "../ui/FormInput"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/Form"
import { useState } from "react";
import { signinFormSchema, SigninSchemaType } from "../../lib/schema/authSchema";
import { useToast } from '../../hooks/use-toast';
import { signIn } from "next-auth/react";
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { PATHS } from '../../config/path.config';


type signInResponseType = {
    error: string | null
    ok: boolean
    status: number
    url: string | null
}

export default function Signin() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<SigninSchemaType>({
        resolver: zodResolver(signinFormSchema),
        defaultValues: {
            number: '',
            password: ''
        }
    })

    async function formHandler(data: SigninSchemaType) {
        try {
            const result: signInResponseType | undefined = await signIn('signin', { ...data, redirect: false });
            console.log("result-signin", result)
            if (!result?.ok) {
                const errorMessage = result?.error?.includes('User') && result?.error?.includes('does not exist')
                    ? 'User does not exist' : result?.error || 'Internal server error';

                toast({
                    title: errorMessage,
                    variant: 'destructive'
                });
                return;
            }
            toast({
                title: 'Login successful!',
                variant: 'default'
            });

            const searchParams = new URLSearchParams(window.location.search)
            const redirect = searchParams.get('next') || PATHS.HOME;
            router.push(redirect);
            // router.refresh();
        } catch (_error) {
            return toast({
                title: 'Internal server error',
                variant: 'destructive',
            });
        }
    }

    const togglePassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setPasswordVisible(!passwordVisible);
    }
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(formHandler)}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name='number'
                            render={({ field }) => (
                                <FormItem className="relative">
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Phone Number' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem className="relative">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type={passwordVisible ? 'text' : 'password'} placeholder="Enter your password" />
                                    </FormControl>
                                    <button type="button" className="absolute right-2 top-8" onClick={togglePassword}>
                                        {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <ButtonLoading
                        className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white"
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        aria-label="submit"
                    >
                        {form.formState.isSubmitting ? 'Please wait' : 'Sign in'}
                    </ButtonLoading>
                    <div className="text-center text-sm mt-4">
                        <div className="space-x-1">
                            <span className="text-gray-400">Don&apos;t have an account?</span>
                            <Link className="text-blue-600 hover:underline" href="/signup">
                                Sign Up
                            </Link>
                        </div>
                        <Link className="text-blue-600 hover:underline block mt-2" href="#">
                            Forgot Password
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    )
}





export function EyeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
}

export function EyeOffIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
}