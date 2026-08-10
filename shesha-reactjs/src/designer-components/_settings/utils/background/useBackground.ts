import { getBackgroundStyle, IBackgroundValue } from "@/designer-components/_settings/utils";
import { HttpClientApi, useHttpClient } from "@/providers";
import { buildUrl } from "@/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { CSSProperties, useEffect, useMemo, useState } from "react";

export type UseBackgroundProps = {
  background?: IBackgroundValue | undefined;
  jsStyle: CSSProperties;
};

const fetchImageAsUrlAsync = async (httpClient: HttpClientApi, fileId: string): Promise<string> => {
  try {
    const url = buildUrl("/api/StoredFile/Download", { id: fileId });
    const response = await httpClient.get<Blob>(url, { responseType: 'blob' });
    // Create a local URL pointing to the binary blob
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Failed to fetch background image:', error);
    return "";
  }
};

export const useBackgroundStyles = (props: UseBackgroundProps): CSSProperties => {
  const { background, jsStyle } = props;
  const httpClient = useHttpClient();

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const storedFileId = isDefined(background) && background.type === 'storedFile'
    ? background.storedFile?.id
    : undefined;

  useEffect(() => {
    const fetchStyles = async (): Promise<void> => {
      const storedImageUrl = !isNullOrWhiteSpace(storedFileId)
        ? await fetchImageAsUrlAsync(httpClient, storedFileId)
        : "";

      setBackgroundImageUrl(storedImageUrl);
    };

    void fetchStyles();
  }, [storedFileId, httpClient]);

  const backgroundStyles = useMemo<CSSProperties>(() => {
    return getBackgroundStyle(background, jsStyle, backgroundImageUrl);
  }, [background, backgroundImageUrl, jsStyle]);

  return backgroundStyles;
};
