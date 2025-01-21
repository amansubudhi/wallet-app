import { TOKEN_EXPIRATION_TIME } from "../config/auth.config";
import { NextAuthOptions } from "next-auth";
import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { ErrorHandler } from "./error";
import { signinFormSchema } from "./schema/authSchema";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'signin',
            id: 'signin',
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "phone number" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                const result = signinFormSchema.safeParse(credentials);
                if (!result.success) {
                    throw new ErrorHandler(
                        'Bad request',
                        'BAD_REQUEST',
                        {
                            fieldErrors: result.error.flatten().fieldErrors,
                        }
                    )
                }
                const { number, password } = result.data;
                const existingUser = await db.user.findUnique({
                    where: {
                        number
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        number: true,
                        password: true,
                    }
                });

                if (!existingUser || !existingUser.password) {
                    throw new ErrorHandler('Phone Number or password is incorrect', 'AUTHENTICATION_FAILED');
                }
                console.log("user -", existingUser)

                const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
                console.log("match-- ", isPasswordMatch);

                if (!isPasswordMatch) {
                    throw new ErrorHandler('Password is incorrect', 'AUTHENTICATION_FAILED')
                }
                return {
                    id: existingUser.id.toString(),
                    name: existingUser.name,
                    number: existingUser.number
                }
            }

        })
    ],
    callbacks: {
        async redirect({ baseUrl }) {
            //Always redirect to the assigned page after login
            return baseUrl;
        },
        async session({ token, session }: any) {
            session.user.id = token.sub
            return session
        }
    },
    pages: {
        signIn: '/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: TOKEN_EXPIRATION_TIME
    },
    jwt: {
        maxAge: TOKEN_EXPIRATION_TIME
    },
    secret: process.env.JWT_SECRET
} satisfies NextAuthOptions