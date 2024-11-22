'use server';

import { db } from '@/database/drizzle';
import { profiles } from '@/database/schema';
import { getCurrentSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const FormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Fullname must be at least 2 characters.',
  }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  dob: z.date(),
  address: z
    .string()
    .min(10, { message: 'Bio must be at least 10 characters.' })
    .max(160, { message: 'Bio must not be longer than 160 characters.' }),
});

export const updateProfile = async (values: z.infer<typeof FormSchema>) => {
  try {
    const { session } = await getCurrentSession();

    if (!session) {
      return { message: 'Unauthorized' };
    }

    const validatedFields = FormSchema.safeParse(values);
    console.log(values);

    if (!validatedFields.success) {
      return { message: 'Invalid or missing fields' };
    }

    const { address, dob, fullName, phoneNumber } = validatedFields.data;

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        address,
        dateOfBirth: dob,
        fullName,
        phoneNumber,
      })
      .where(eq(profiles.userId, session.userId))
      .returning();

    return {
      message: 'Successfully update your profile',
      data: updatedProfile,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Internal Server Error',
    };
  }
};
