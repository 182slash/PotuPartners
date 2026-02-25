#!/usr/bin/env ts-node
/**
 * seed.ts — Creates the initial admin account and sample staff members.
 *
 * Run ONCE after running migrations on a fresh database:
 *   npx ts-node src/scripts/seed.ts
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running, OR
 * edit the defaults below (change them immediately after first login).
 */

import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

const BCRYPT_ROUNDS = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);

interface SeedUser {
  email:        string;
  password:     string;
  fullName:     string;
  displayName:  string;
  role:         'admin' | 'partner' | 'associate';
  title:        string;
  bio:          string;
  specialty:    string;
  linkedinUrl:  string;
}

const SEED_USERS: SeedUser[] = [
  {
    email:       process.env['ADMIN_EMAIL'] ?? 'admin@potupartners.site',
    password:    process.env['ADMIN_PASSWORD'] ?? 'ChangeMe!SecurePassword2024',
    fullName:    'System Administrator',
    displayName: 'Admin',
    role:        'admin',
    title:       'System Administrator',
    bio:         '',
    specialty:   '',
    linkedinUrl: '',
  },
  {
    email:       'adriana.potu@potupartners.site',
    password:    'TempPass!2024#Partner',
    fullName:    'Adriana M. Potu',
    displayName: 'A. Potu',
    role:        'partner',
    title:       'Founding & Managing Partner',
    bio:         'Adriana has led the firm through landmark arbitration victories and high-stakes corporate litigation over a career spanning three decades.',
    specialty:   'Corporate Litigation · International Arbitration',
    linkedinUrl: '',
  },
  {
    email:       'edmund.kessler@potupartners.site',
    password:    'TempPass!2024#Partner2',
    fullName:    'Dr. Edmund F. Kessler',
    displayName: 'E. Kessler',
    role:        'partner',
    title:       'Senior Partner',
    bio:         'Edmund brings deep expertise in cross-border transactions and regulatory compliance.',
    specialty:   'Mergers & Acquisitions · Regulatory Affairs',
    linkedinUrl: '',
  },
  {
    email:       'nkechi.adeyemi@potupartners.site',
    password:    'TempPass!2024#Partner3',
    fullName:    'Nkechi O. Adeyemi',
    displayName: 'N. Adeyemi',
    role:        'partner',
    title:       'Partner',
    bio:         'Nkechi has established herself as a formidable voice in constitutional litigation.',
    specialty:   'Constitutional Law · Civil Rights',
    linkedinUrl: '',
  },
  {
    email:       'j.hargreaves@potupartners.site',
    password:    'TempPass!2024#Partner4',
    fullName:    'Jonathan S. Hargreaves',
    displayName: 'J. Hargreaves',
    role:        'partner',
    title:       'Partner',
    bio:         'Jonathan advises on the full spectrum of real estate transactions and restructurings.',
    specialty:   'Real Estate · Corporate Restructuring',
    linkedinUrl: '',
  },
  {
    email:       'l.chen@potupartners.site',
    password:    'TempPass!2024#Assoc1',
    fullName:    'Li-Mei Chen',
    displayName: 'L. Chen',
    role:        'associate',
    title:       'Senior Associate',
    bio:         'Li-Mei specialises in cross-border M&A and corporate governance matters.',
    specialty:   'Corporate · M&A',
    linkedinUrl: '',
  },
  {
    email:       'o.okonkwo@potupartners.site',
    password:    'TempPass!2024#Assoc2',
    fullName:    'Obinna Okonkwo',
    displayName: 'O. Okonkwo',
    role:        'associate',
    title:       'Associate',
    bio:         'Obinna focuses on regulatory compliance and administrative law.',
    specialty:   'Regulatory · Administrative Law',
    linkedinUrl: '',
  },
];

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('\n🌱  Starting database seed...\n');

    for (const user of SEED_USERS) {
      // Check if already exists
      const { rows: existing } = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existing.length > 0) {
        console.log(`  ⏭  Skipping ${user.email} (already exists)`);
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
      const id           = uuidv4();

      await client.query(
        `INSERT INTO users (
          id, email, password_hash, full_name, display_name, role,
          title, bio, specialty, linkedin_url, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6::user_role,
          $7, $8, $9, $10, true
        )`,
        [
          id,
          user.email,
          passwordHash,
          user.fullName,
          user.displayName,
          user.role,
          user.title,
          user.bio,
          user.specialty,
          user.linkedinUrl || null,
        ]
      );

      console.log(`  ✅  Created ${user.role}: ${user.fullName} <${user.email}>`);
    }

    console.log('\n🎉  Seed complete!\n');
    console.log('⚠️   IMPORTANT: Change all staff passwords immediately after first login.');
    console.log('    Admin login: ' + SEED_USERS[0]!.email);
    console.log('    Admin password: [as set in ADMIN_PASSWORD env var]\n');

  } catch (err) {
    console.error('\n❌  Seed failed:', (err as Error).message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
