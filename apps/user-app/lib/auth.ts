import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import zod from "zod";


const userSchema = zod.object({
    phone: zod.string(),
    password: zod.string()
})

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1231231231" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any) {
                const result = userSchema.safeParse(credentials);
                if (!result.success) {
                    throw new Error("Invalid credentials");
                }
                const { phone, password } = result.data;
                const existingUser = await db.user.findFirst({
                    where: {
                        number: phone
                    }
                });

                if (existingUser) {
                    const passwordValidation = await bcrypt.compare(password, existingUser.password);
                    if (passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.name,
                            email: existingUser.number
                        }
                    }
                    return null;
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const user = await db.user.create({
                        data: {
                            number: phone,
                            password: hashedPassword
                        }
                    });

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.number
                    }
                } catch (e) {
                    console.error(e);
                }

                return null
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async session({ token, session }: any) {
            session.user.id = token.sub
            return session
        }
    }
}