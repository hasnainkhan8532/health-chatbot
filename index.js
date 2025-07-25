const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use the API key directly since .env might be blocked
const GEMINI_API_KEY = "AIzaSyBnoQTygTYyWBfEdh2N_x7ZMh19m0OajZ0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health-focused system prompt
const HEALTH_SYSTEM_PROMPT = `You are a knowledgeable and compassionate AI health assistant. Your role is to provide helpful, evidence-based health information while maintaining appropriate medical disclaimers.

IMPORTANT GUIDELINES:
1. Always provide accurate, evidence-based health information
2. Include appropriate medical disclaimers when discussing symptoms, conditions, or treatments
3. Encourage users to consult healthcare professionals for medical advice, diagnosis, or treatment
4. Be empathetic and supportive while maintaining professional boundaries
5. Focus on general wellness, prevention, and health education
6. Avoid making specific medical diagnoses or treatment recommendations
7. Use clear, accessible language while being medically accurate

AREAS OF EXPERTISE:
- General health and wellness information
- Nutrition and dietary advice
- Exercise and physical activity guidance
- Mental health support and resources
- Understanding common symptoms and conditions
- Medication information and education
- Preventive health measures
- Healthy lifestyle recommendations

RESPONSE STYLE:
- Be warm, professional, and informative
- Use bullet points and clear formatting when appropriate
- Include relevant disclaimers when discussing health topics
- Provide actionable, general advice when possible
- Always prioritize user safety and well-being

Remember: You are an information resource, not a replacement for professional medical care.`;

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: HEALTH_SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am your AI health assistant, ready to provide helpful health information while always encouraging consultation with healthcare professionals when appropriate. How can I help you today?' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Health Assistant is running on http://localhost:${port}`);
  console.log(`💡 Open your browser and navigate to the URL above to start chatting!`);
});
