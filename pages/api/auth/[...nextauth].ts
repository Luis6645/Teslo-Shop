import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { dbUser } from "../../../database";
import { User } from '../../../models';

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        // ...add more providers here
        Credentials({
            name: 'Custom login',
            credentials: {
                email: { label: 'Correo', type: 'email', placeholder: 'correo@google.com' },
                password: { label: 'Contraseña', type: 'password', placeholder: 'Contraseña' },
            },
            async authorize(credentials) {
                //return { name: 'Juan', correo: 'prueba@prueba.prueba', role: 'admin' }

                return await dbUser.checkUserEmailPassword(credentials!.email, credentials!.password)
            }
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID ?? '',
            clientSecret: process.env.GITHUB_SECRET ?? '',
        }),
    ],

    //Custom Pages
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register',
    },

    // Callbacks

    session: {
        maxAge: 2592000, // 30 days
        strategy: 'jwt',
        updateAge: 86400 // 24 hours
    },

    callbacks: {

        async jwt({ token, account, user }) {

            if (account) {
                token.accessToken = account.access_token

                switch (account.type) {
                    case 'oauth':
                        token.user = await dbUser.oAUthToDbUser(user?.email || '', user?.name || '')
                        break
                    case 'credentials':
                        token.user = user
                        break;
                }
            }
            return token
        },

        async session({ session, token, user }) {

            session.accessToken = token.accessToken as any;
            session.user = token.user as any

            return session
        }

    }
}
export default NextAuth(authOptions)