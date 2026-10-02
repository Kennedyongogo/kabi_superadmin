import { useEffect, useState, useCallback } from "react";
import { BRAND_LOGO_SRC } from "../brand";

/**
 * Resolves a remote/media URL to the brand logo when missing or broken.
 */
export default function useBrandImageSrc(src) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const usingLogo = !src || failed;
  const resolvedSrc = usingLogo ? BRAND_LOGO_SRC : src;

  const onError = useCallback(
    (e) => {
      if (usingLogo) return;
      setFailed(true);
      if (e?.currentTarget) {
        e.currentTarget.onerror = null;
        e.currentTarget.src = BRAND_LOGO_SRC;
      }
    },
    [usingLogo]
  );

  return { src: resolvedSrc, usingLogo, onError };
}
