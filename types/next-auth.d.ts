import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id: string;
            name: string;
            email?: string | null;
            number: string | null;
        };
    }

    interface JWT {
        accessToken?: string;
        id: string;
        number?: string;
    }
}
