import { updateProfile } from '@/app/(dashboard)/profile/actions';
import { Profile } from '@/database/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type RequestType = {
  address: string;
  fullName: string;
  phoneNumber: string;
  dob: Date;
};
type ResponseType = { message: string; data?: Profile };

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      try {
        const response = await updateProfile(json);

        if (!response.data) {
          throw new Error(response.message);
        }

        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['current'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
    onError: ({ message }) => {
      console.log(message);
      toast.error(message);
    },
  });

  return mutation;
};
