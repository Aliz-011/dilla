import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Attendance } from '@/database/schema';
import { kyInstance } from '@/lib/ky';

type RequestType = { form: FormData; action: 'check-in' | 'check-out' } & {
  params: { attendanceId: string };
};
type ResponseType = { data: Attendance };

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, action, params: { attendanceId } }) => {
      const formData = form;
      formData.append('action', action);

      const response = await kyInstance
        .patch(`/api/attendance/${attendanceId}`, {
          body: form,
        })
        .json<ResponseType>();

      return response;
    },
    onSuccess({ data }) {
      toast.success('Success');
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({
        queryKey: ['attendance', { id: data.id }],
      });
    },
    onError() {
      toast.error('Failed to update attendance');
    },
  });

  return mutation;
};
