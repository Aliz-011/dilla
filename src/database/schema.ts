import { InferSelectModel, relations } from 'drizzle-orm';
import {
  text,
  pgTable,
  timestamp,
  pgEnum,
  varchar,
  time,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'employee']);

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email').unique().notNull(),
  nrp: varchar('nrp').unique().notNull(),
  password: text('password').notNull(),
  role: roleEnum().notNull().default('employee'),
  createdAt: timestamp('created_at', { mode: 'date' }),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  attendances: many(attendances),
  photos: many(photos),
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
  createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
});

export const departmentRelations = relations(departments, ({ many }) => ({
  profiles: many(profiles),
}));

export const statusEnum = pgEnum('status', [
  'present',
  'absent',
  'late',
  'on_leave',
]);

export const attendances = pgTable(
  'attendances',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date', { mode: 'date', withTimezone: false }).notNull(),
    checkInTime: time(),
    checkOutTime: time(),
    status: statusEnum(),
    notes: text('notes'),
  },
  (table) => ({
    userId: index().on(table.userId),
  })
);

export const attendenceRelations = relations(attendances, ({ one, many }) => ({
  user: one(users, {
    fields: [attendances.userId],
    references: [users.id],
  }),
  photos: many(photos),
}));

export const photos = pgTable(
  'photos',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'set null' }),
    photoUrl: text('photo_url').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
  },
  (table) => ({
    userId: index().on(table.userId),
  })
);

export const photoRelations = relations(photos, ({ many, one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
  attendances: many(attendances),
}));

export const photosToAttendances = pgTable(
  'photos_to_attendances',
  {
    attendanceId: text('attendance_id')
      .notNull()
      .references(() => attendances.id),
    photoId: text('photo_id')
      .notNull()
      .references(() => photos.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.attendanceId, t.photoId] }),
  })
);

export const photosToAttendancesRelations = relations(
  photosToAttendances,
  ({ one }) => ({
    attendance: one(attendances, {
      fields: [photosToAttendances.attendanceId],
      references: [attendances.id],
    }),
    photo: one(photos, {
      fields: [photosToAttendances.photoId],
      references: [photos.id],
    }),
  })
);

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Attendance = InferSelectModel<typeof attendances>;
export type Profile = InferSelectModel<typeof profiles>;
export type Department = InferSelectModel<typeof departments>;
