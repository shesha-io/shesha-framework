import { useShaRouting } from '@/providers/shaRouting';
import { isSameUrls } from '@/utils/url';

export interface UseLoginUrlArgs {
  homePageUrl: string;
  unauthorizedRedirectUrl: string;
}

export const useLoginUrl = ({ homePageUrl, unauthorizedRedirectUrl }: UseLoginUrlArgs): string => {
  const { router } = useShaRouting();

  const redirectUrl =
    isSameUrls(router.path, homePageUrl) || isSameUrls(router.path, unauthorizedRedirectUrl)
      ? ''
      : `/?returnUrl=${encodeURIComponent(router.fullPath)}`;

  return `${unauthorizedRedirectUrl}${redirectUrl}`;
};
