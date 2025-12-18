import { google } from 'googleapis';
import { NextResponse } from 'next/server';

async function getSheetsClient() {
    // Handle private key - replace literal \n with actual newlines
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
        // Replace escaped newlines (both \\n and \n as literal strings)
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            fullName,
            contactNumber,
            emailAddress,
            treatment,
            specialRequests,
            date,
            time,
            duration = '',
        } = body;

        // Basic input validation
        if (
            !fullName ||
            !contactNumber ||
            !emailAddress ||
            !treatment ||
            !date ||
            !time ||
            !duration
        ) {
            return NextResponse.json(
                { message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        const sheets = await getSheetsClient();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        fullName,
                        contactNumber,
                        emailAddress,
                        treatment,
                        specialRequests || '',
                        date,
                        time,
                        duration,
                    ],
                ],
            },
        });

        return NextResponse.json({ message: 'Booking successful!' });
    } catch (error) {
        console.error(
            'Google Sheets API Error:',
            error.response?.data || error.message
        );
        return NextResponse.json(
            { message: 'Failed to save booking. Please try again later.' },
            { status: 500 }
        );
    }
}

// Handle other methods
export async function GET() {
    return NextResponse.json(
        { message: 'Method Not Allowed' },
        { status: 405 }
    );
}
