import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Extender tipos de NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: string;
        };
    }
    interface User {
        id: string;
        email: string;
        name?: string | null;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        sub: string;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
