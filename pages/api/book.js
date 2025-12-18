import { google } from 'googleapis';

// Cache the authenticated client to avoid re-authentication overhead
let sheetsClient = null;

async function getSheetsClient() {
    if (sheetsClient) return sheetsClient;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const {
        fullName,
        contactNumber,
        emailAddress,
        treatment,
        specialRequests,
        date,
        time,
        duration = '',
    } = req.body;

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
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
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
                        specialRequests,
                        date,
                        time,
                        duration,
                    ],
                ],
            },
        });

        return res.status(200).json({ message: 'Booking successful!' });
    } catch (error) {
        console.error(
            'Google Sheets API Error:',
            error.response?.data || error.message
        );
        return res
            .status(500)
            .json({ message: 'Failed to save booking. Please try again later.' });
    }
}
