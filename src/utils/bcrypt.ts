import { compare, hash } from 'bcrypt';


export const hashValue = async (passwordText: string, saltRound?: number) => {
  return hash(passwordText, saltRound || 10);
}

export const compareValue = (value: string, hashedPassword: string) => compare(value, hashedPassword).catch(() => false);