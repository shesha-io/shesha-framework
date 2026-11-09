import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const header = "sha-script-analyser-header";
  const title = "sha-script-analyser-title";
  const summary = "sha-script-analyser-summary";
  const errorCount = "sha-script-analyser-errors";
  const warningCount = "sha-script-analyser-warnings";
  const infoCount = "sha-script-analyser-infos";
  const list = "sha-script-analyser-list";
  const row = "sha-script-analyser-row";
  const rowIcon = "sha-script-analyser-row-icon";
  const message = "sha-script-analyser-message";
  const source = "sha-script-analyser-source";
  const position = "sha-script-analyser-position";
  const empty = "sha-script-analyser-empty";

  const errorColor = "#f14c4c";
  const warningColor = "#cca700";
  const infoColor = "#3794ff";
  const mutedColor = "#8c8c8c";

  const scriptAnalyser = cx("sha-script-analyser", css`
        display: flex;
        flex-direction: column;
        max-height: 160px;
        border-top: 1px solid #3c3c3c;
        background-color: #1e1e1e;
        color: #cccccc;
        font-size: 12px;

        .${header} {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 12px;
            background-color: #252526;

            .${title} {
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
                color: #bbbbbb;
            }

            .${summary} {
                display: flex;
                gap: 12px;

                .${errorCount} {
                    color: ${errorColor};
                }
                .${warningCount} {
                    color: ${warningColor};
                }
                .${infoCount} {
                    color: ${infoColor};
                }

                .anticon {
                    margin-right: 4px;
                }
            }
        }

        .${list} {
            overflow-y: auto;
            scrollbar-width: thin;

            .${row} {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 2px 12px;
                cursor: pointer;

                &:hover {
                    background-color: #2a2d2e;
                }

                .${rowIcon} {
                    &.error {
                        color: ${errorColor};
                    }
                    &.warning {
                        color: ${warningColor};
                    }
                    &.info {
                        color: ${infoColor};
                    }
                }

                .${message} {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .${source} {
                    color: ${mutedColor};
                    border: 1px solid #454545;
                    border-radius: 10px;
                    padding: 0 6px;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .${position} {
                    color: ${mutedColor};
                    min-width: 90px;
                    text-align: right;
                    white-space: nowrap;
                }
            }

            .${empty} {
                padding: 4px 12px;
                color: ${mutedColor};
                font-style: italic;
            }
        }
  `);

  return {
    scriptAnalyser,
    header,
    title,
    summary,
    errorCount,
    warningCount,
    infoCount,
    list,
    row,
    rowIcon,
    message,
    source,
    position,
    empty,
  };
});
