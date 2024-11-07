import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { kyInstance } from '@/lib/ky';
import { AttendanceWithUserAndProfile } from '@/types';

export const useGetAttendances = () => {
  const params = useSearchParams();
  const from = params.get('from') || '';
  const to = params.get('to') || '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendances', { from, to }],
    queryFn: () =>
      kyInstance
        .get('/api/attendance', {
          searchParams: {
            from,
            to,
          },
        })
        .json<AttendanceWithUserAndProfile[]>(),
    gcTime: 10 * (60 * 1000),
    staleTime: 5 * (60 * 1000),
  });

  return { data, isLoading, isError };
};
