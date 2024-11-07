import { kyInstance } from '@/lib/ky';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type RequestType = {
  file: FormData;
  action: 'check-in' | 'check-out';
};
type ResponseType = { message: string; filename: string };

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (data) => {
      const formData = data.file;
      formData.append('action', data.action);

      const response = await kyInstance
        .post('/api/upload', {
          body: formData,
        })
        .json<ResponseType>();

      return response;
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
    onError: () => {
      toast.error('Failed to fill attendance');
    },
  });

  return mutation;
};
