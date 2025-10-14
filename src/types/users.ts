export interface User {
  id: number;
  name: string;
  email: string;
  type?: "guest" | "member";
  role: "admin" | "customer";
}
