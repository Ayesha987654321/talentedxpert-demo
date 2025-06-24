import {z} from "zod"
export const teamSchema = z.object({
    name: z.string().min(1,"Please Add Team Name"),
    description: z.string(),
    logoUrl: z.string().optional(),
})