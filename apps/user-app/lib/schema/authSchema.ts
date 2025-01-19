import { number, z } from 'zod';

export const signinFormSchema = z.object({
    number: z.string().regex(
        /^\d{10}$/,
        "Invalid phone number. It must contain exactly 10 digits."
    ),
    password: z.string().min(1, "Password is required"),
})

export type SigninSchemaType = z.infer<typeof signinFormSchema>;