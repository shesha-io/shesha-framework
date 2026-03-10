import { createStyles } from "@/styles";

// Create styles using antd-style
export const useStyles = createStyles(({ token, css }) => {
  const fontWeightMedium = '500';

  // Azure DevOps inspired colors mapped to Ant Design tokens
  const colors = {
    error: token.colorError,
    errorBg: token.colorErrorBg,
    warning: token.colorWarning,
    warningBg: token.colorWarningBg,
    success: token.colorSuccess,
    successBg: token.colorSuccessBg,
    info: token.colorInfo,
    infoBg: token.colorInfoBg,
    processing: token.colorPrimary,
    processingBg: token.colorPrimaryBg,
    textPrimary: token.colorText,
    textSecondary: token.colorTextSecondary,
    textTertiary: token.colorTextTertiary,
    border: token.colorBorder,
    borderSecondary: token.colorBorderSecondary,
    bgContainer: token.colorBgContainer,
    bgLayout: token.colorBgLayout,
    bgElevated: token.colorBgElevated,
    bgSpotlight: token.colorBgSpotlight,
  };

  return {
    container: css`
      font-family: ${token.fontFamily};
      background-color: ${colors.bgLayout};
      color: ${colors.textPrimary};
      border-radius: ${token.borderRadiusLG}px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid ${colors.border};
    `,

    header: css`
      background: linear-gradient(135deg, ${colors.bgElevated} 0%, ${colors.bgContainer} 100%);
      padding: ${token.padding}px ${token.paddingLG}px;
      border-bottom: 1px solid ${colors.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: ${token.padding}px;
    `,

    headerLeft: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingLG}px;
      flex-wrap: wrap;
    `,

    pipelineStatus: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingXS}px;
    `,

    statusIndicator: css`
      width: 8px;
      height: 8px;
      border-radius: 50%;
    `,

    statusIndicatorSuccess: css`
      background-color: ${colors.success};
    `,

    statusIndicatorError: css`
      background-color: ${colors.error};
    `,

    statusIndicatorWarning: css`
      background-color: ${colors.warning};
    `,

    statusText: css`
      font-size: ${token.fontSizeSM}px;
      font-weight: ${fontWeightMedium};
      color: ${colors.textSecondary};
    `,

    pipelineInfo: css`
      display: flex;
      flex-direction: column;
      gap: 2px;
    `,

    pipelineName: css`
      font-size: ${token.fontSize}px;
      font-weight: ${token.fontWeightStrong};
      color: ${colors.textPrimary};
    `,

    pipelineTime: css`
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textTertiary};
    `,

    headerRight: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingXS}px;
      flex-wrap: wrap;
    `,

    toolbar: css`
      padding: ${token.paddingSM}px ${token.paddingLG}px;
      background: ${colors.bgContainer};
      border-bottom: 1px solid ${colors.border};
      display: flex;
      flex-wrap: wrap;
      gap: ${token.paddingLG}px;
      align-items: center;
    `,

    searchContainer: css`
      flex: 1;
      min-width: 300px;
    `,

    searchBox: css`
      display: flex;
      align-items: center;
      background: ${colors.bgLayout};
      border: 1px solid ${colors.border};
      border-radius: ${token.borderRadius}px;
      padding: ${token.paddingXXS}px;
      transition: all ${token.motionDurationMid};
      
      &:focus-within {
        border-color: ${colors.info};
        box-shadow: ${token.boxShadowSecondary};
      }
    `,

    searchInput: css`
      flex: 1;
      background: transparent;
      border: none;
      color: ${colors.textPrimary};
      font-size: ${token.fontSize}px;
      min-width: 0;
      
      &:focus {
        outline: none;
      }
      
      &::placeholder {
        color: ${colors.textTertiary};
      }
    `,

    searchResults: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingXXS}px;
      padding: 0 ${token.paddingSM}px;
      border-left: 1px solid ${colors.border};
    `,

    matchCount: css`
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textTertiary};
      white-space: nowrap;
    `,

    navBtn: css`
      background: ${colors.bgElevated};
      border: 1px solid ${colors.border};
      color: ${colors.textSecondary};
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      cursor: pointer;
      border-radius: ${token.borderRadiusXS}px;
      transition: all ${token.motionDurationFast};
      
      &:hover:not(:disabled) {
        background: ${colors.bgLayout};
        color: ${colors.textPrimary};
        border-color: ${colors.textSecondary};
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    `,

    filterContainer: css`
      flex-shrink: 0;
    `,

    levelFilters: css`
      display: flex;
      gap: ${token.paddingXS}px;
      flex-wrap: wrap;
    `,

    levelFilter: css`
      background: ${colors.bgLayout};
      border: 1px solid ${colors.border};
      color: ${colors.textSecondary};
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      border-radius: ${token.borderRadiusSM}px;
      font-size: ${token.fontSizeSM}px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all ${token.motionDurationFast};
      font-weight: ${fontWeightMedium};
      
      &:hover {
        background: ${colors.bgElevated};
      }
    `,

    levelFilterActive: css`
      background: ${colors.infoBg};
      border-color: ${colors.info};
      color: ${colors.info};
    `,

    filterDot: css`
      width: 6px;
      height: 6px;
      border-radius: 50%;
    `,

    viewOptions: css`
      display: flex;
      gap: ${token.paddingLG}px;
      flex-shrink: 0;
      flex-wrap: wrap;
    `,

    toggleOption: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingXS}px;
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textSecondary};
      cursor: pointer;
      user-select: none;
    `,

    statistics: css`
      padding: ${token.paddingSM}px ${token.paddingLG}px;
      background: ${colors.bgContainer};
      border-bottom: 1px solid ${colors.border};
    `,

    statsGrid: css`
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: ${token.padding}px;
    `,

    statItem: css`
      display: flex;
      flex-direction: column;
      gap: 2px;
    `,

    statLabel: css`
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textTertiary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,

    statValue: css`
      font-size: ${token.fontSizeLG}px;
      font-weight: ${token.fontWeightStrong};
      color: ${colors.textPrimary};
    `,

    statValueError: css`
      color: ${colors.error};
    `,

    statValueWarning: css`
      color: ${colors.warning};
    `,

    statValueSuccess: css`
      color: ${colors.success};
    `,

    contentContainer: css`
      flex: 1;
      background: ${colors.bgLayout};
      overflow: hidden;
      position: relative;
    `,

    loadingState: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: ${token.padding}px;
    `,

    emptyState: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: ${token.padding}px;
    `,

    emptyIcon: css`
      font-size: 48px;
      opacity: 0.3;
    `,

    emptyTitle: css`
      font-size: ${token.fontSizeLG}px;
      font-weight: ${token.fontWeightStrong};
      color: ${colors.textPrimary};
      margin: 0;
    `,

    emptyText: css`
      font-size: ${token.fontSize}px;
      color: ${colors.textSecondary};
      margin: 0;
    `,

    logLine: css`
      border-bottom: 1px solid ${colors.border};
      transition: background-color ${token.motionDurationFast};
    `,

    logLineHover: css`
      &:hover {
        background-color: ${colors.bgElevated};
      }
    `,

    logLineError: css`
      background-color: ${colors.errorBg};
      
      &:hover {
        background-color: ${colors.errorBg}dd;
      }
    `,

    logLineWarning: css`
      background-color: ${colors.warningBg};
      
      &:hover {
        background-color: ${colors.warningBg}dd;
      }
    `,

    logLineSuccess: css`
      background-color: ${colors.successBg};
      
      &:hover {
        background-color: ${colors.successBg}dd;
      }
    `,

    logLineSection: css`
      background-color: ${colors.infoBg};
      
      &:hover {
        background-color: ${colors.infoBg}dd;
      }
    `,

    logLineContent: css`
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 ${token.paddingXS}px;
    `,

    lineNumber: css`
      width: 70px;
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textTertiary};
      text-align: right;
      padding-right: ${token.padding}px;
      font-family: ${token.fontFamilyCode};
      user-select: none;
      flex-shrink: 0;
    `,

    timelineIndicator: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
      margin-right: ${token.paddingXS}px;
      flex-shrink: 0;
    `,

    timelineLineTop: css`
      width: 2px;
      flex: 1;
      min-height: 8px;
    `,

    timelineLineBottom: css`
      width: 2px;
      flex: 1;
      min-height: 8px;
    `,

    timelineDot: css`
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid;
      flex-shrink: 0;
    `,

    timelineDuration: css`
      font-size: ${token.fontSizeSM - 2}px;
      color: ${colors.textTertiary};
      margin-top: 2px;
      white-space: nowrap;
    `,

    expandToggle: css`
      background: transparent;
      border: none;
      color: ${colors.textTertiary};
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      margin-right: ${token.paddingXXS}px;
      border-radius: ${token.borderRadiusXS}px;
      transition: all ${token.motionDurationFast};
      
      &:hover {
        background: ${colors.bgElevated};
        color: ${colors.textPrimary};
      }
    `,

    logIcon: css`
      width: 24px;
      font-size: ${token.fontSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `,

    logMessage: css`
      flex: 1;
      font-size: ${token.fontSize}px;
      font-family: ${token.fontFamilyCode};
      white-space: pre;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: ${token.padding}px;
    `,

    taskName: css`
      font-weight: ${token.fontWeightStrong};
      color: ${colors.textPrimary};
    `,

    durationBadge: css`
      background: ${colors.bgElevated};
      color: ${colors.textSecondary};
      font-size: ${token.fontSizeSM}px;
      padding: 1px 6px;
      border-radius: ${token.borderRadiusXS}px;
      margin-left: ${token.paddingXS}px;
      font-family: ${token.fontFamily};
    `,

    searchHighlight: css`
      background-color: ${token.yellow3};
      color: inherit;
      padding: 0 1px;
      border-radius: ${token.borderRadiusXS}px;
    `,

    logTimestamp: css`
      width: 70px;
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textTertiary};
      text-align: right;
      padding-left: ${token.padding}px;
      flex-shrink: 0;
      font-family: ${token.fontFamilyCode};
    `,

    footer: css`
      padding: ${token.paddingSM}px ${token.paddingLG}px;
      background: ${colors.bgContainer};
      border-top: 1px solid ${colors.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${token.fontSizeSM}px;
      color: ${colors.textSecondary};
      flex-wrap: wrap;
      gap: ${token.padding}px;
    `,

    footerLeft: css`
      display: flex;
      align-items: center;
      gap: ${token.padding}px;
      flex-wrap: wrap;
    `,

    liveIndicator: css`
      display: flex;
      align-items: center;
      gap: ${token.paddingXS}px;
      color: ${colors.success};
      font-weight: ${fontWeightMedium};
    `,

    liveDot: css`
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: ${colors.success};
      animation: pulse 2s infinite;
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `,

    lineCount: css`
      font-weight: ${fontWeightMedium};
    `,

    searchInfo: css`
      color: ${colors.info};
    `,

    footerRight: css`
      display: flex;
      align-items: center;
      gap: ${token.padding}px;
      flex-wrap: wrap;
    `,

    scrollToBottomBtn: css`
      background: ${colors.bgElevated};
      border: 1px solid ${colors.border};
      color: ${colors.textPrimary};
      padding: ${token.paddingXXS}px ${token.padding}px;
      border-radius: ${token.borderRadius}px;
      font-size: ${token.fontSizeSM}px;
      cursor: pointer;
      font-weight: ${fontWeightMedium};
      transition: all ${token.motionDurationFast};
      
      &:hover:not(:disabled) {
        background: ${colors.bgLayout};
        border-color: ${colors.textSecondary};
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,

    scrollPosition: css`
      background: ${colors.bgLayout};
      border: 1px solid ${colors.border};
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      border-radius: ${token.borderRadius}px;
      min-width: 80px;
      text-align: center;
      font-weight: ${fontWeightMedium};
    `,

    customScrollbar: css`
      &::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      &::-webkit-scrollbar-track {
        background: ${colors.bgLayout};
      }
      
      &::-webkit-scrollbar-thumb {
        background: ${colors.border};
        border-radius: 6px;
        border: 3px solid ${colors.bgLayout};
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: ${colors.textTertiary};
      }
      
      &::-webkit-scrollbar-corner {
        background: ${colors.bgLayout};
      }
    `,
  };
});
