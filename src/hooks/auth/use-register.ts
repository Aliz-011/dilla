import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { RegisterSchema } from '@/lib/schemas';
import { register } from '@/app/(auth)/sign-up/actions';
import { toast } from 'sonner';

type RequestType = z.infer<typeof RegisterSchema>;

export const useRegister = () => {
  const mutation = useMutation<any, Error, RequestType>({
    mutationFn: async ({ email, nrp, password }) => {
      const response = await register({ email, nrp, password });

      return response;
    },
    onSuccess() {
      toast.success('Successfully registered.');
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return mutation;
};
