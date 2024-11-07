import { Attendance } from '@/database/schema';
import { kyInstance } from '@/lib/ky';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type RequestType = { form: FormData } & { params: { attendanceId: string } };
type ResponseType = { data: Attendance };

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, params: { attendanceId } }) => {
      const response = await kyInstance
        .patch(`/api/attendance/${attendanceId}`, {
          body: form,
        })
        .json<ResponseType>();

      return response;
    },
    onSuccess({ data }) {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({
        queryKey: ['attendance', { id: data.id }],
      });
    },
    onError(error) {
      toast.error('Failed to update attendance');
    },
  });

  return mutation;
};
