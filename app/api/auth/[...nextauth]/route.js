import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// ✅ Debug: check if .env.local is loading
console.log("🚀 Loaded ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("🚀 Loaded ADMIN_PASSWORD_HASH:", process.env.ADMIN_PASSWORD_HASH);

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



        console.log("🔑 ENV EMAIL:", adminEmail);
        console.log("🔑 ENV HASH:", adminHash);
        console.log("🔑 Input EMAIL:", credentials?.email);
        console.log("🔑 Input PWD:", credentials?.password);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        const okEmail =
          credentials.email.toLowerCase() === adminEmail.toLowerCase();
        console.log("✅ Email Match?", okEmail);

        const okPwd = adminHash
          ? await bcrypt.compare(credentials.password, adminHash)
          : false;
        console.log("✅ Password Match?", okPwd);

        if (okEmail && okPwd) {
          console.log("🎉 Login success!");
          return {
            id: "admin-1",
            email: adminEmail,
            role: "admin",
            name: "RVM Admin",
          };
        }

        console.log("❌ Login failed");
        return null;
      },
    }),
  ],
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
