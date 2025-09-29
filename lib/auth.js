import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { connectDB } from "./db";
import User from "@/models/user";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const { email, password } = credentials || {};
        const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
        if (!user) return null;
        const ok = await compare(password || "", user.passwordHash);
        if (!ok) return null;
        return { id: user._id.toString(), name: user.name || "", email: user.email, phone: user.phone || "" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.phone = user.phone || "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid;
      session.user.phone = token.phone || "";
      return session;
    },
  },
};
