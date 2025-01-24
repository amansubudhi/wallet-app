import { number, z } from 'zod';

export const signinFormSchema = z.object({
    number: z.string().regex(
        /^\d{10}$/,
        "Invalid phone number. It must contain exactly 10 digits."
    ),
    password: z.string().min(1, "Password is required"),
})

export const guestSigninFormSchema = z.object({
    email: z.string().email("Email is invalid").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
})

export const signupFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Email is invalid").min(1, "Email is required"),
    number: z.string().regex(
        /^\d{10}$/,
        "Invalid phone number. It must contain exactly 10 digits."
    ),
    password: z.string().min(1, "Password is required"),
})

export type GuestSigninSchemaType = z.infer<typeof guestSigninFormSchema>;
export type SigninSchemaType = z.infer<typeof signinFormSchema>;
export type SignupSchemaType = z.infer<typeof signupFormSchema>;