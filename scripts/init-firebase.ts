/**
 * Firebase Initialization Script
 *
 * This script creates the initial admin user in Firestore.
 * Run this once after setting up your Firebase project.
 *
 * Usage: npx ts-node scripts/init-firebase.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('❌ Missing Firebase Admin credentials in .env.local');
    console.error('Please ensure the following variables are set:');
    console.error('- FIREBASE_PROJECT_ID');
    console.error('- FIREBASE_CLIENT_EMAIL');
    console.error('- FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function initializeFirebase() {
  try {
    console.log('🚀 Initializing Firebase...');

    // Check if admin user already exists
    const existingAdmin = await db
      .collection('users')
      .where('email', '==', 'kasasatrevor25@gmail.com')
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const now = new Date().toISOString();

    const adminUserRef = db.collection('users').doc();
    await adminUserRef.set({
      name: 'Super Admin',
      email: 'kasasatrevor25@gmail.com',
      role: 'admin',
      status: 'active',
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: kasasatrevor25@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    // Create indexes (these should also be created in Firebase Console)
    console.log('\n📝 Note: Please create the following indexes in Firebase Console:');
    console.log('1. users: email (ASC)');
    console.log('2. players: name (ASC)');
    console.log('3. payments: playerId (ASC), date (DESC)');
    console.log('4. payments: date (DESC)');
    console.log('5. expenses: expenseDate (DESC)');
    console.log('6. match_days: matchDate (DESC)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }
}

initializeFirebase();
