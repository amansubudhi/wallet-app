"use server"

import db from "@repo/db/client"
import { ErrorHandler } from "./error"
import { signupFormSchema, SignupSchemaType } from "./schema/authSchema"
import bcrypt from "bcrypt"


export default async function signUp(_data: SignupSchemaType) {
    try {
        const data = signupFormSchema.parse(_data);

        const isUserExist = await db.user.findFirst({
            where: { number: data.number }
        })

        if (isUserExist) {
            throw new ErrorHandler('User with this number already exist', 'BAD_REQUEST');
        }

        const hashedPassword = await bcrypt.hash(
            data.password,
            10
        );

        await db.$transaction(
            async (txn) => {
                const user = await txn.user.create({
                    data: {
                        ...data,
                        password: hashedPassword,
                        Balance: {
                            create: {
                                amount: 0,
                                locked: 0,
                            },
                        },
                    },
                });
                return user;
            },
            {
                maxWait: 5000,
                timeout: 15000
            }
        );
        return {
            status: true,
            code: 201,
            message: "User registered successfully."
        };
    } catch (error) {
        throw new ErrorHandler('Registration failed. Please try again!!', 'INTERNAL_SERVER_ERROR')
    }
}