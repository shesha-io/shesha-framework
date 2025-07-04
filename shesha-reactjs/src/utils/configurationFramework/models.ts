export enum ConfigurationItemVersionStatus {
  /**
   * Version is still a work in progress
   */
  Draft = 1,

  /**
   * Configuration changes for this version have been completed but is awaiting to made live
   */
  Ready = 2,

  /**
   * Version is currently Live
   */
  Live = 3,

  /**
   * Version was set to ‘Ready’ but was decided that it should not go live
   */
  Cancelled = 4,

  /**
   * Version was previously Live but has been retired
   */
  Retired = 5,
}

interface VersionStatusMapItem {
  text: string;
  color: string;
}
type VersionStatusMap = {
  [key in ConfigurationItemVersionStatus]: VersionStatusMapItem;
};

export const ConfigurationItemVersionStatusMap: VersionStatusMap = {
  [ConfigurationItemVersionStatus.Draft]: { text: 'Draft', color: '#b4b4b4' },
  [ConfigurationItemVersionStatus.Ready]: { text: 'Ready', color: '#4DA6FF' },
  [ConfigurationItemVersionStatus.Live]: { text: 'Live', color: '#87d068' },
  [ConfigurationItemVersionStatus.Cancelled]: { text: 'Cancelled', color: '#cd201f' },
  [ConfigurationItemVersionStatus.Retired]: { text: 'Retired', color: '#FF7518' },
};