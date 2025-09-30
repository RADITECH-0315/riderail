// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        if (
          credentials?.email.toLowerCase() === adminEmail.toLowerCase() &&
          (await bcrypt.compare(credentials.password, adminHash))
        ) {
          return {
            id: "admin-1",
            email: adminEmail,
            role: "admin",
            name: "RVM Admin",
          };
        }

        return null; // ❌ Invalid login
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role || "user";
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};
