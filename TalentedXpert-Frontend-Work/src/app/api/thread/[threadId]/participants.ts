import { NextApiRequest, NextApiResponse } from 'next';

// Simulated database function (replace with your actual database logic)
async function fetchParticipantsFromDatabase(thread: any): Promise<{ name: string }[]> {
    // Placeholder logic: Dynamic participants based on threadId
    const user1 = thread?.expertProfile?.user?.firstName + '' + thread?.expertProfile?.user?.lastName
    const user2 = thread?.task?.requesterProfile?.user?.firstName + '' + thread?.task?.requesterProfile?.user?.lastName
    const dynamicParticipants = [
        { name: `${user1}` },
        { name: `${user2}` },
    ];
    return dynamicParticipants;
}

// Define a response type for better type safety
interface ApiResponse {
    participants?: { name: string }[];
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Explicitly type threadId as string (or string | undefined if optional)
        const { threadId, ...threadRest } = req.query as { threadId?: string; [key: string]: any };

        if (!threadId) {
            return res.status(400).json({ error: 'threadId is required' });
        }

        // Fetch participants dynamically from the database
        const thread = { id: threadId, ...threadRest };
        const participants = await fetchParticipantsFromDatabase(thread);
        return res.status(200).json({ participants });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}