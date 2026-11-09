import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Monaco } from '@monaco-editor/react';
import { IPosition, Uri, UriComponents } from 'monaco-editor';
import { CaretDownOutlined, CaretRightOutlined, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import _ from 'lodash';
import { DiagnosticSeverity, ScriptDiagnostic } from './models';
import { markerToDiagnostic, sortDiagnostics, summariseDiagnostics } from './utils';
import { useStyles } from './styles';

interface IScriptAnalyserProps {
  monaco: Monaco;
  filePath: string;
  onNavigate: (fileUri: UriComponents, position: IPosition) => void;
}

const SeverityIcon: FC<{ severity: number; className: string }> = ({ severity, className }) => {
  if (severity === DiagnosticSeverity.error)
    return <CloseCircleFilled className={`${className} error`} />;
  if (severity === DiagnosticSeverity.warning)
    return <ExclamationCircleFilled className={`${className} warning`} />;
  return <InfoCircleFilled className={`${className} info`} />;
};

export const ScriptAnalyser: FC<IScriptAnalyserProps> = ({ monaco, filePath, onNavigate }) => {
  const { styles } = useStyles();
  const [expanded, setExpanded] = useState(false);

  const normalisedPath = useMemo(() => _.trimStart(filePath, '/'), [filePath]);
  const matchesFile = useCallback((resource: Uri): boolean => {
    return _.trimStart(resource.path, '/') === normalisedPath;
  }, [normalisedPath]);

  const collectDiagnostics = useCallback((): ScriptDiagnostic[] => {
    const markers = monaco.editor.getModelMarkers({}).filter((marker) => matchesFile(marker.resource));
    return sortDiagnostics(markers.map(markerToDiagnostic));
  }, [monaco, matchesFile]);

  const [diagnostics, setDiagnostics] = useState<ScriptDiagnostic[]>(collectDiagnostics);

  useEffect(() => {
    const subscription = monaco.editor.onDidChangeMarkers((resources) => {
      if (resources.some(matchesFile))
        setDiagnostics(collectDiagnostics());
    });
    return () => subscription.dispose();
  }, [monaco, matchesFile, collectDiagnostics]);

  const summary = useMemo(() => summariseDiagnostics(diagnostics), [diagnostics]);

  const onDiagnosticClick = (diagnostic: ScriptDiagnostic): void => {
    const model = monaco.editor.getModels().find((candidate) => matchesFile(candidate.uri));
    if (model)
      onNavigate(model.uri, { lineNumber: diagnostic.lineNumber, column: diagnostic.column });
  };

  const renderRows = (): ReactNode => {
    if (diagnostics.length === 0)
      return <div className={styles.empty}>No issues detected</div>;

    return diagnostics.map((diagnostic) => (
      <div
        key={diagnostic.key}
        className={styles.row}
        role="button"
        tabIndex={0}
        onClick={() => onDiagnosticClick(diagnostic)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onDiagnosticClick(diagnostic);
          }
        }}
      >
        <SeverityIcon severity={diagnostic.severity} className={styles.rowIcon} />
        <span className={styles.message}>{diagnostic.message}</span>
        <span className={styles.source}>{diagnostic.source}</span>
        <span className={styles.position}>Ln {diagnostic.lineNumber}, Col {diagnostic.column}</span>
      </div>
    ));
  };

  return (
    <div className={styles.scriptAnalyser}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <span className={styles.title}>
          {expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
          Script Analyser
        </span>
        <span className={styles.summary}>
          <span className={styles.errorCount}>
            <CloseCircleFilled />
            {summary.errors}
          </span>
          <span className={styles.warningCount}>
            <ExclamationCircleFilled />
            {summary.warnings}
          </span>
          <span className={styles.infoCount}>
            <InfoCircleFilled />
            {summary.infos}
          </span>
        </span>
      </div>
      {expanded && (
        <div className={styles.list}>
          {renderRows()}
        </div>
      )}
    </div>
  );
};
