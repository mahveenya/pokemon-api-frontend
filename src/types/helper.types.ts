// TODO: currently typeguars do validator's job,
// I want to separate them, research and compare tools like zod, yup, valibot.
// Typeguards should only be responsible for type checking,
// while validators should handle the actual validation logic.
export type Typeguard<T> = (value: unknown) => value is T;
