import {z} from "zod"
export const LoginSchema = z.object({
    email: z.string({
        errorMap: () => ({ message: "you must fill out email"})
    }).min(1).email(),
    password: z.string({
        errorMap: () => ({ message: "you must fill out password"})
    }).min(1),
    rememberMe: z.boolean(),
    loginAs: z.string({
        errorMap: () => ({ message: "you must select login as"})
    }).min(1)
})