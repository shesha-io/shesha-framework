import { useShaRouting } from '@/providers/shaRouting';

export const useIdQueryParam = (): { id: string } => {
  const { router } = useShaRouting();

  console.log('useIdQueryParam useShaRouting router :>> ', router);

  return { id: '' };
};
