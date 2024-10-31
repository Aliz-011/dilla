import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetAttendences = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['attendences'],
    queryFn: async () => {
      //
    },
  });

  return query;
};
