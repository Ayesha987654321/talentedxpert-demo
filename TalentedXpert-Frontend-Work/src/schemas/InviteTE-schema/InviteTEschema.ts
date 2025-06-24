import {z} from "zod"


export const InviteTEschema = z.object({
    description: z.string().min(1,"you must add description"),
    expertProfileId: z.string(),
    taskId: z.string().min(1,"Selection of task is required"),
    
})