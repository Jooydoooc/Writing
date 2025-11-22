export default async function handler(request, response) {
    // Enable CORS
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            error: 'Only POST requests allowed'
        });
    }

    try {
        const data = request.body;

        // Validate required fields
        if (!data.studentName || !data.studentSurname) {
            return response.status(400).json({
                success: false,
                error: 'Student name and surname are required'
            });
        }

        // Get Telegram credentials from environment
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Missing Telegram environment variables');
            return response.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
        }

        // Format message for Telegram
        const message = `
🎓 *New IELTS Writing Submission*

*Student:* ${data.studentName} ${data.studentSurname}
*Time Spent:* ${data.timerValue}
*Submitted:* ${new Date(data.submittedAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━

*Task 1 Question:*
${data.task1Question}

*Task 1 Answer:*
${data.task1Answer || 'No answer provided'}
*Words:* ${data.task1Answer ? data.task1Answer.split(/\s+/).filter(w => w.length > 0).length : 0}

━━━━━━━━━━━━━━━━━━━━

*Task 2 Question:*
${data.task2Question}

*Task 2 Answer:*
${data.task2Answer || 'No answer provided'}
*Words:* ${data.task2Answer ? data.task2Answer.split(/\s+/).filter(w => w.length > 0).length : 0}

━━━━━━━━━━━━━━━━━━━━

*Total Words:* ${(data.task1Answer ? data.task1Answer.split(/\s+/).filter(w => w.length > 0).length : 0) + (data.task2Answer ? data.task2Answer.split(/\s+/).filter(w => w.length > 0).length : 0)}
        `.trim();

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const telegramResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResult.ok) {
            throw new Error(`Telegram API: ${telegramResult.description}`);
        }

        // Return success
        return response.status(200).json({
            success: true,
            message: 'Submission sent successfully'
        });

    } catch (error) {
        console.error('Submission error:', error);
        return response.status(500).json({
            success: false,
            error: error.message
        });
    }
}
