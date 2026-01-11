const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;

export const isMobileUserAgent = (userAgent: string | null): boolean => {
  if (!userAgent) return false;
  return MOBILE_UA_REGEX.test(userAgent);
};
