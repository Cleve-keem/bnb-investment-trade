import { Lock, Mail, Phone, User, LucideIcon } from "lucide-react";

export interface RegistrationField {
  id: number;
  name: string;
  type: string;
  icon: LucideIcon | null;
}

export interface LoginField {
  id: number;
  name: string;
  type: string;
  icon: LucideIcon | null;
}

export const registrationConstants: RegistrationField[] = [
  { id: 1, name: "Username", type: "text", icon: User },
  { id: 2, name: "Name", type: "text", icon: null },
  { id: 3, name: "Email", type: "email", icon: Mail },
  { id: 4, name: "Phone number", type: "tel", icon: Phone },
  { id: 5, name: "Password", type: "password", icon: Lock },
  { id: 6, name: "Confirm Password", type: "password", icon: Lock },
];

export const loginConstants: LoginField[] = [
  { id: 1, name: "Email", type: "email", icon: Mail },
  { id: 2, name: "Password", type: "password", icon: Lock },
];
