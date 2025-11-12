import express from "express";
import axios from 'axios';
import { auth } from "../middlewares/auth.js";
import { AdminAuth } from "../middlewares/admin-auth.js";
import { User } from "../models/user.models.js";
const router = express.Router()

router.post('/send-prompt', async (req, res) => {
    const { prompt } = req.body;
  
    if (!prompt) {
      return res.status(400).send({ error: 'Prompt is required' });
    }
  
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model  : 'llama3.1',
        prompt : prompt,
        stream : false,
      });
  
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to process the request' });
    }
});

router.post('/api/reset', (req, res) => {
  conversationHistory = [];
  res.json({ message: 'Conversation history reset.' });
});

router.post('/api/chat', async (req, res) => {
    const { model, messages, options, stream, keep_alive } = req.body;
    let conversationHistory = [];

    if (!model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Model and messages are required fields' });
    }
  
    conversationHistory.push(...messages);

    const userMessage = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    console.log('User message:', userMessage);

    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'WheelZOnRent',
        prompt: userMessage,
        stream: stream || false,
        keep_alive: keep_alive || '5m',
      });
      
      console.log('Model response:', response.data);
      const assistantMessage = response.data.response || 'No response from model';
  
      conversationHistory.push({ role: 'assistant', content: assistantMessage });

      res.json({
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'WheelZOnRent',
        choices: [
          {
            message: {
              role: 'assistant',
              content: assistantMessage
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: userMessage.length,
          completion_tokens: assistantMessage.length,
          total_tokens: userMessage.length + assistantMessage.length
        }
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: error.message });
    }
});

export default router;