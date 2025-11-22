export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        // Validation
        if (!data.studentName || !data.studentSurname) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and surname required' 
            });
        }

        // Telegram configuration
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Telegram environment variables not set');
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error' 
            });
        }

        // Format message
        const message = `
🎓 *IELTS Writing Pro - New Submission*

*Student:* ${data.studentName} ${data.studentSurname}
*Duration:* ${data.timerValue}
*Submitted:* ${new Date(data.submittedAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━

*Task 1 Question:*
${data.task1Question}

*Task 1 Answer:*
${data.task1Answer || 'No answer provided'}
*Words:* ${data.task1Answer ? data.task1Answer.split(/\s+/).length : 0}

━━━━━━━━━━━━━━━━━━━━

*Task 2 Question:*
${data.task2Question}

*Task 2 Answer:*
${data.task2Answer || 'No answer provided'}
*Words:* ${data.task2Answer ? data.task2Answer.split(/\s+/).length : 0}

━━━━━━━━━━━━━━━━━━━━

*Total Words:* ${(data.task1Answer ? data.task1Answer.split(/\s+/).length : 0) + (data.task2Answer ? data.task2Answer.split(/\s+/).length : 0)}
        `.trim();

        // Send to Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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

        const result = await telegramResponse.json();

        if (!result.ok) {
            throw new Error(`Telegram API: ${result.description}`);
        }

        // Success response
        return res.status(200).json({
            success: true,
            message: 'Test submitted successfully',
            messageId: result.result.message_id
        });

    } catch (error) {
        console.error('Submission error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
