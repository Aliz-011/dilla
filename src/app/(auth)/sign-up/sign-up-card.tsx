'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RegisterSchema } from '@/lib/schemas';
import { useRegister } from '@/hooks/auth/use-register';

type FormValues = z.infer<typeof RegisterSchema>;

export const SignUpCard = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      password: '',
      nrp: '',
      email: '',
    },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess(data) {
        form.reset();
      },
    });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Create your account</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="nrp"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NRP</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter NRP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button disabled={isPending} className="w-full uppercase">
                Register
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardContent className="flex items-center justify-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-700">
            Sign in here.
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
