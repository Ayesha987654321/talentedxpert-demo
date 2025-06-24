import {z} from "zod"

const docs = z.object({
    key: z.string(),
    fileUrl: z.string()
}).optional();
export const disputeSchema = z.object({
    description: z.string().min(1,"you must add description"),
    status: z.string(),
    taskId: z.string().min(1,"Select task first"),
    documents: z.array(docs).optional()
})