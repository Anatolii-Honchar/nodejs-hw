import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const resetEmailTemplatePath = new URL(
  '../templates/reset-password-email.html',
  import.meta.url,
);

const resetEmailSuccessResponse = {
  message: 'Password reset email sent successfully',
};

export const registerUser = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = await User.create({
    email: req.body.email,
    password: hashedPassword,
  });

  const session = await createSession(newUser._id);
  setSessionCookies(res, session);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  if (req.cookies.sessionId) {
    await Session.deleteOne({ _id: req.cookies.sessionId });
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Session not found');
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isRefreshTokenExpired = session.refreshTokenValidUntil < new Date();

  if (isRefreshTokenExpired) {
    await session.deleteOne();

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    throw createHttpError(401, 'Session token expired');
  }

  await session.deleteOne();

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const requestResetEmail = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json(resetEmailSuccessResponse);
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const templateSource = await fs.readFile(resetEmailTemplatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;
  const html = template({
    username: user.username,
    resetLink,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json(resetEmailSuccessResponse);
};

export const resetPassword = async (req, res) => {
  let payload;

  try {
    payload = jwt.verify(req.body.token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  if (typeof payload !== 'object' || !payload.sub || !payload.email) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  await user.save();

  res.status(200).json({
    message: 'Password reset successfully',
  });
};
