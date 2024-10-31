import { useQuery } from '@tanstack/react-query';

import { User } from '@/database/schema';
import { kyInstance } from '@/lib/ky';

export const useSession = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['current'],
    queryFn: () => kyInstance.get('/api/user').json<User>(),
    staleTime: 5 * (60 * 1000),
    gcTime: 10 * (60 * 1000),
    refetchOnWindowFocus: true,
  });

  return { data, isLoading, isError };
};
