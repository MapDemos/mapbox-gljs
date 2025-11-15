const OPENAI_API_KEY = ''; 
const MCP_SERVER_URL = 'http://localhost:3000/mcp';

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

let messages = [
    {
        role: 'system',
        content: 'You are a helpful assistant that can help with location-based queries using Mapbox services.'
    }
];

// Function to call your MCP server
async function callMCPTool(toolName, arguments) {
    const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: arguments
            }
        })
    });

    const result = await response.json();
    return result.result;
}

// Define available functions for OpenAI
const functions = [
    {
        name: 'forward_geocode',
        description: 'Find coordinates for a location',
        parameters: {
            type: 'object',
            properties: {
                q: {
                    type: 'string',
                    description: 'The location to geocode'
                }
            },
            required: ['q']
        }
    }
];

function addMessage(content, className) {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = content;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    messages.push({ role: 'user', content: userMessage });
    input.value = '';

    try {
        // Call OpenAI directly
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages,
                functions: functions,
                function_call: 'auto'
            })
        });

        const data = await response.json();
        const responseMessage = data.choices[0].message;

        if (responseMessage.function_call) {
            // OpenAI wants to call a function
            const functionName = responseMessage.function_call.name;
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);

            // Map to MCP tool names
            const toolMapping = {
                'forward_geocode': 'forward_geocode_tool'
            };

            const mcpToolName = toolMapping[functionName];

            if (mcpToolName) {
                // Call your MCP server
                const toolResult = await callMCPTool(mcpToolName, functionArgs);

                // Send function result back to OpenAI
                const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        messages: [
                            ...messages,
                            responseMessage,
                            {
                                role: 'function',
                                name: functionName,
                                content: JSON.stringify(toolResult)
                            }
                        ]
                    })
                });

                const secondData = await secondResponse.json();
                addMessage(secondData.choices[0].message.content, 'assistant');
                messages.push({ role: 'assistant', content: secondData.choices[0].message.content });
            }
        } else {
            // Regular response
            addMessage(responseMessage.content, 'assistant');
            messages.push({ role: 'assistant', content: responseMessage.content });
        }

    } catch (error) {
        addMessage('Error: ' + error.message, 'assistant');
    }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});