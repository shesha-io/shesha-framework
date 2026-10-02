import { IConfigurationLoader } from "@/providers/configurationItemsLoader/configurationLoader";
import { HttpClientApi } from "@/publicJsApis/apis/httpClient";


export const createHttpClientMock = (): HttpClientApi => {
  return {
    get: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  };
};

export const createConfigurationLoaderMock = (): IConfigurationLoader => {
  return {
    getCachedConfigAsync: vi.fn(),
    getCurrentConfigAsync: vi.fn(),
    clearCacheAsync: vi.fn(),
    getFormAsync: vi.fn(),
    getRefListAsync: vi.fn(),
    getEntityFormIdAsync: vi.fn(),
    clearFormCache: vi.fn(),
    getComponentAsync: vi.fn(),
    updateComponentAsync: vi.fn(),
    getModuleNameByAccessorAsync: vi.fn(),
  };
};
