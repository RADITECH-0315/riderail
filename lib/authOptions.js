// /lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import User from "../models/user";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        // ---------------- Admin login ----------------
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;       // plain text (dev)
        const adminHash = process.env.ADMIN_PASSWORD_HASH;      // bcrypt hash (prod)

        if (email === adminEmail) {
          // Plain password mode (dev)
          if (adminPassword && password === adminPassword) {
            return {
              id: "admin-1",
              email: adminEmail,
              role: "admin",
              name: "RVM Admin",
            };
          }

          // Hashed password mode (prod)
          if (adminHash && (await bcrypt.compare(password, adminHash))) {
            return {
              id: "admin-1",
              email: adminEmail,
              role: "admin",
              name: "RVM Admin",
            };
          }

          return null; // wrong admin password
        }

        // ---------------- Customer login ----------------
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user._id),
          email: user.email,
          role: user.role || "customer",
          name: user.name,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async redirect({ baseUrl, url }) {
      // ✅ Redirect based on role
      try {
        const u = new URL(url, baseUrl);
        if (u.pathname.includes("admin")) return `${baseUrl}/admin/dashboard`;
      } catch {}
      return `${baseUrl}/#book`;
    },
  },

  pages: {
    signIn: "/login",
  },
};
