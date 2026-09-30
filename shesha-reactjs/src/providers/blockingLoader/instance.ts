import { isDefined } from "@/utils";
import { nanoid } from "@/utils/uuid";

/** Loader instance with methods for progressive feedback and control */
export interface ILoaderInstance {
  /** Updates the message displayed in the loader */
  updateMessage(message: string): void;
  /** Switches the loader to blocking mode (prevents user interaction) */
  block(): void;
  /** Switches the loader to non-blocking mode (allows user interaction) */
  unblock(): void;
  /** Closes and removes this specific loader instance */
  close(): void;
}

/** Loader API */
export interface IBlockingApi {
  showLoader: (message?: string, isBlocking?: boolean) => ILoaderInstance;
  hideLoaders: () => void;
}

/** Loader context */
export interface IBlockingLoader {
  loaders: ILoaderData[];
  getActiveLoader: () => ILoaderData | undefined;
  showLoader: (message?: string, isBlocking?: boolean) => ILoaderInstance;
  hideLoaders: () => void;
}

export type BlockingLoaderLevel = 'page' | 'form' | 'component'/* reserved */;

interface ILoaderData {
  id: string;
  message: string;
  isBlocking: boolean;
}

export class BlockingLoaderInstance implements IBlockingLoader {
  private _loaders: ILoaderData[] = [];

  private updater: () => void;

  forceUpdate = (): void => this.updater();

  updateLoader = (id: string, updates: Partial<ILoaderData>): void => {
    this._loaders = this._loaders.map((loader) => loader.id === id ? { ...loader, ...updates } : loader);
    this.forceUpdate();
  };

  removeLoader = (id: string): void => {
    this._loaders = this._loaders.filter((loader) => loader.id !== id);
    this.forceUpdate();
  };

  constructor(updater: () => void) {
    this.updater = updater;
  }

  get loaders(): ILoaderData[] {
    return this._loaders;
  }

  getActiveLoader = (): ILoaderData | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const l = this._loaders.findLast(() => true);
    return isDefined(l) ? { ...l, isBlocking: this._loaders.some((l) => l.isBlocking) } : undefined;
  };

  showLoader = (message: string = 'Please wait...', isBlocking: boolean = true): ILoaderInstance => {
    const loaderId = nanoid();
    this._loaders.push({ id: loaderId, message, isBlocking });

    // Return the loader instance with control methods
    const instance: ILoaderInstance = {
      updateMessage: (newMessage: string) => {
        this.updateLoader(loaderId, { message: newMessage });
      },
      block: () => {
        this.updateLoader(loaderId, { isBlocking: true });
      },
      unblock: () => {
        this.updateLoader(loaderId, { isBlocking: false });
      },
      close: () => {
        this.removeLoader(loaderId);
      },
    };

    this.forceUpdate();
    return instance;
  };

  hideLoaders = (): void => {
    this._loaders = [];
    this.forceUpdate();
  };
};
