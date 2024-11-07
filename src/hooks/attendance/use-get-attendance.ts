import { kyInstance } from '@/lib/ky';
import { AttendanceWithUserAndProfile } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export const useGetAttendance = () => {
  const params = useParams();
  const attendanceId = params.attendanceId as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', { id: attendanceId }],
    queryFn: async () => {
      const response = await kyInstance
        .get(`/api/attendance/${attendanceId}`)
        .json<{ data: AttendanceWithUserAndProfile }>();

      return response.data;
    },
  });

  return { data, isLoading, isError };
};
