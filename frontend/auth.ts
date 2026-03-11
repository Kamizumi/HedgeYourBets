import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
 
// AWS DynamoDB configuration for next-auth
const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
  region: process.env.AUTH_DYNAMODB_REGION!,
}
 
const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  adapter: DynamoDBAdapter(client, { tableName: "users" }),
  
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Be defensive: token may be undefined in some flows (middleware/session retrieval),
      // so guard property access to avoid runtime TypeErrors which surface as SessionTokenError.
      try {
        if (token) {
          (session as any).accessToken = (token as any).accessToken ?? null;
          (session as any).provider = (token as any).provider ?? null;
          (session as any).userId = (token as any).id ?? null;
        } else if (user) {
          // When token isn't available but we have a user (adapter-backed session),
          // attach any useful information from the user record if present.
          (session as any).provider = (user as any).provider ?? null;
          (session as any).userId = user.id ?? null;
          (session as any).accessToken = null;
        } else {
          (session as any).accessToken = null;
          (session as any).provider = null;
          (session as any).userId = null;
        }
      } catch (e) {
        // If anything goes wrong, ensure we return a valid session object and
        // surface the error for debugging rather than crashing middleware.
        console.error('session callback error', e);
        (session as any).accessToken = null;
        (session as any).provider = null;
        (session as any).userId = null;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign-in for debugging
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        name: user.name
      });
      
      // DynamoDB adapter automatically handles user creation
      // This event is just for logging/monitoring purposes
    },
    async createUser({ user }) {
      console.log('New user created in DynamoDB:', {
        userId: user.id,
        email: user.email,
        name: user.name
      });
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
  },
  debug: process.env.NODE_ENV === 'development',
});