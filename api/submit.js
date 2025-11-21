/**
 * Vercel serverless function to handle IELTS test submissions and send to Telegram
 * Uses Node.js 22 runtime
 */

export default async function handler(request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
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

        // Get Telegram credentials from environment variables
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Missing Telegram environment variables');
            return response.status(500).json({
                success: false,
                error: 'Server configuration error - missing Telegram credentials'
            });
        }

        // Format the message for Telegram
        const message = this.formatTelegramMessage(data);

        // Send message to Telegram
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const telegramResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResult.ok) {
            console.error('Telegram API error:', telegramResult);
            throw new Error(`Telegram API error: ${telegramResult.description}`);
        }

        // Return success response
        return response.status(200).json({
            success: true,
            message: 'Submission sent to Telegram successfully',
            telegramMessageId: telegramResult.result.message_id
        });

    } catch (error) {
        console.error('Submission processing error:', error);
        
        return response.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

/**
 * Format the submission data into a readable Telegram message
 */
function formatTelegramMessage(data) {
    const submittedTime = new Date(data.submittedAt).toLocaleString();
    const task1WordCount = data.task1Answer ? data.task1Answer.split(/\s+/).filter(word => word.length > 0).length : 0;
    const task2WordCount = data.task2Answer ? data.task2Answer.split(/\s+/).filter(word => word.length > 0).length : 0;
    
    return `
<b>🎓 IELTS Writing Test Submitted</b>

<b>Student Information:</b>
• Name: ${data.studentName} ${data.studentSurname}
• Set: ${data.setName} (${data.setId})
• Submitted: ${submittedTime}
• Test Duration: ${data.timerValue}

<b>Task 1 Question:</b>
${data.task1QuestionText || 'N/A'}

<b>Task 1 Answer:</b>
${data.task1Answer || 'No answer provided'}
<i>Word Count: ${task1WordCount}</i>

<b>Task 2 Question:</b>
${data.task2QuestionText || 'N/A'}

<b>Task 2 Answer:</b>
${data.task2Answer || 'No answer provided'}
<i>Word Count: ${task2WordCount}</i>

<b>Total Words:</b> ${task1WordCount + task2WordCount}

✅ <b>Test completed successfully</b>
    `.trim();
}

// Attach the format function to the module
export { formatTelegramMessage };
