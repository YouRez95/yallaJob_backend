const getEnv = (key:string, defaultValue?:string):string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`)
  }

  return value;
}

export const NODE_ENV = getEnv("NODE_ENV", "development");
export const PORT = getEnv("PORT", "8000");
export const MONGO_LOCAL = getEnv("MONGO_LOCAL");
export const MONGO_CLOUD = getEnv("MONGO_CLOUD");
export const ORIGIN = getEnv("ORIGIN");
export const STORAGE_BUCKET = getEnv("STORAGE_BUCKET");