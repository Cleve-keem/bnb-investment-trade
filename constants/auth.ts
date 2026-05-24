import { Lock, Mail, Phone, User, LucideIcon } from "lucide-react";

export interface RegistrationField {
  id: number;
  name: string;
  fieldName: string;
  type: string;
  icon: LucideIcon | null;
}

export interface LoginField {
  id: number;
  name: string;
  fieldName: string;
  type: string;
  icon: LucideIcon | null;
}

export const registrationConstants: RegistrationField[] = [
  { id: 1, name: "Username", fieldName: "username", type: "text", icon: User },
  { id: 2, name: "Name", fieldName: "nameGroup", type: "text", icon: null },
  {
    id: 3,
    name: "Email Address",
    fieldName: "email",
    type: "email",
    icon: Mail,
  },
  {
    id: 4,
    name: "Phone Number",
    fieldName: "phoneNumber",
    type: "tel",
    icon: Phone,
  },
  {
    id: 5,
    name: "Password",
    fieldName: "password",
    type: "password",
    icon: Lock,
  },
  {
    id: 6,
    name: "Confirm Password",
    fieldName: "confirmPassword",
    type: "password",
    icon: Lock,
  },
];

export const loginConstants: LoginField[] = [
  {
    id: 1,
    name: "Email Address",
    fieldName: "email",
    type: "email",
    icon: Mail,
  },
  {
    id: 2,
    name: "Password",
    fieldName: "password",
    type: "password",
    icon: Lock,
  },
];
