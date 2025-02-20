import { TOKEN_EXPIRATION_TIME } from "../config/auth.config";
import { NextAuthOptions } from "next-auth";
import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { ErrorHandler } from "./error";
import { signinFormSchema, guestSigninFormSchema } from "./schema/authSchema";
import jwt from "jsonwebtoken";

interface UserType {
    id: string;
    name: string;
    email?: string | null;
    number: string | null;
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'signin',
            id: 'signin',
            credentials: {
                number: { label: "Number", type: "text", placeholder: "Number" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<UserType | null> {
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

                const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

                if (!isPasswordMatch) {
                    throw new ErrorHandler('Password is incorrect', 'AUTHENTICATION_FAILED')
                }
                return {
                    id: existingUser.id.toString(),
                    name: existingUser.name || "",
                    number: existingUser.number || ""
                }
            }

        }),
        CredentialsProvider({
            name: 'guest',
            id: 'guest',
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {

                const result = guestSigninFormSchema.safeParse(credentials);
                if (!result.success) {
                    throw new ErrorHandler(
                        'Bad request',
                        'BAD_REQUEST',
                        {
                            fieldErrors: result.error.flatten().fieldErrors,
                        }
                    )
                }
                const { email, password } = result.data;

                const guestUser = await db.user.findUnique({
                    where: {
                        email
                    },
                    select: {
                        id: true,
                        name: true,
                        number: true,
                        password: true,
                    }
                })

                if (!guestUser || !guestUser.password) {
                    throw new ErrorHandler('Phone Number or password is incorrect', 'AUTHENTICATION_FAILED');
                }

                const isPasswordMatch = await bcrypt.compare(password, guestUser.password);

                if (!isPasswordMatch) {
                    throw new ErrorHandler('Password is incorrect', 'AUTHENTICATION_FAILED')
                }

                return {
                    id: guestUser.id.toString(),
                    name: guestUser.name,
                    number: guestUser.number
                }

            }

        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const typedUser = user as UserType;
                token.id = typedUser.id;
                token.accessToken = jwt.sign(
                    { id: typedUser.id, number: typedUser.number || "" },
                    process.env.JWT_SECRET || "websocketsecret",
                    { expiresIn: TOKEN_EXPIRATION_TIME }
                );
            }
            return token;
        },
        async redirect({ baseUrl }) {
            return baseUrl;
        },
        async session({ token, session }: any) {
            session.user = {
                id: token.id,
                name: token.name || "",
                email: token.email || undefined,
            };
            session.accessToken = token.accessToken;
            return session;
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