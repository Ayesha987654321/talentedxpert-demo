import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const API_KEY = process.env.REACT_APP_VIDEOSDK_API_KEY as string;
const SECRET_KEY = process.env.REACT_APP_VIDEOSDK_SECRET_KEY as string;

const API_BASE_URL = "https://api.videosdk.live";

export async function POST(req: NextRequest) {
    // Generate JWT token
    const token = jwt.sign(
        {
            apikey: API_KEY,
            permissions: ['allow_join', 'allow_mod'],
            version: 2,
        },
        SECRET_KEY,
        { expiresIn: '2h', algorithm: 'HS256' }
    );

    const url = `${API_BASE_URL}/v2/rooms`;
    const options = {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
    };

    const response = await fetch(url, options)
    const data = await response.json()

    const roomId = data.roomId

    return NextResponse.json({ token, roomId });
}