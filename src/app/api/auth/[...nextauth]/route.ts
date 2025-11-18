// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

// Auth.js에서 만들어준 handlers를 그대로 export
export const { GET, POST } = handlers;
