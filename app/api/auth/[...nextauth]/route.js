import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Only export handlers — not authOptions itself
export { handler as GET, handler as POST };
