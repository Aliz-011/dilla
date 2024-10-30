import { InferSelectModel, relations } from 'drizzle-orm';
import {
  text,
  pgTable,
  timestamp,
  pgEnum,
  varchar,
  time,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'employee']);

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email').unique().notNull(),
  nrp: varchar('nrp').unique().notNull(),
  password: text('password').notNull(),
  role: roleEnum(),
  createdAt: timestamp('created_at', { mode: 'date' }),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  attendences: many(attendences),
}));

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  departmentId: text('department_id').references(() => departments.id, {
    onDelete: 'set null',
  }),
  fullName: text('full_name'),
  phoneNumber: varchar('phone_number'),
  dateOfBirth: timestamp('date_of_birth', { mode: 'date' }),
  address: text('address'),
  createdAt: timestamp('created_at', { mode: 'date' }),
});

export const profileInfoRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  department: one(departments, {
    fields: [profiles.departmentId],
    references: [departments.id],
  }),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }),
});

export const departmentRelations = relations(departments, ({ many }) => ({
  profiles: many(profiles),
}));

export const attendences = pgTable('attendences', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date', { mode: 'date', withTimezone: true }),
  checkInTime: time(),
  checkOutTime: time(),
  status: varchar('status').notNull(),
  notes: text('notes'),
});

export const attendenceRelations = relations(attendences, ({ one }) => ({
  user: one(users, {
    fields: [attendences.userId],
    references: [users.id],
  }),
}));

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
