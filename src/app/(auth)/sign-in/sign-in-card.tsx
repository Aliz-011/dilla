'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { LoginSchema } from '@/lib/schemas';
import { login } from './actions';

type FormValues = z.infer<typeof LoginSchema>;

export const SignInCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      password: '',
      nrp: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const { error, success, message } = await login(values);

      if (!success) {
        throw new Error(error);
      }

      toast.success(message);
      form.reset();
      router.replace('/attendance');
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Absen Biro SDM Polda Papua</CardTitle>
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
                    <Input
                      type="text"
                      placeholder="Enter your nrp"
                      {...field}
                    />
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
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button disabled={isLoading} className="w-full ">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* <CardContent className="flex items-center justify-center">
        <p className="text-sm">
          Dont have an account?{' '}
          <Link href="/sign-up" className="text-blue-700">
            Sign up here.
          </Link>
        </p>
      </CardContent> */}
    </Card>
  );
};
