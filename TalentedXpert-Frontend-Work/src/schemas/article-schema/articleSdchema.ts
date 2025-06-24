import {z} from "zod"

const docs = z.object({
    key: z.string(),
    fileUrl: z.string()
}).optional();
export const articleSchema = z.object({
    description: z.string().min(1,"Add Description"),
    title: z.string().min(1, 'Add Title'),
    profileId: z.number(),
    documents: z.array(docs).optional(),
    image: z.object({
        key: z.string().optional(),
        fileUrl: z.string().optional()
    }).optional()
})