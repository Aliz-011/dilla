import { useQuery } from '@tanstack/react-query';

import { kyInstance } from '@/lib/ky';

type User = {
  id: string;
  email: string;
  nrp: string;
  role: 'admin' | 'employee';
  createdAt: Date | null;
};

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
