import express from "express";
import { auth } from "../middlewares/auth.js";
import { AdminAuth } from "../middlewares/admin-auth.js";
import { User } from "../models/user.models.js";
import { sendEmail } from "../config/mailer.js";
const router = express.Router()
import dotenv from 'dotenv';
dotenv.config();

router.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
  
    if (!to || !subject || !text ) {
      return res.status(400).send('Missing required parameters');
    }
  
    try {
      await sendEmail(to, subject, text);
      res.send('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email: ', error);
      res.status(500).send('Failed to send email');
    }
});

export default router;