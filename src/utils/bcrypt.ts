import bcrypt from 'bcrypt';


export const hashValue = async (passwordText: string, saltRound?: number) => {
  return bcrypt.hash(passwordText, saltRound || 10);
}