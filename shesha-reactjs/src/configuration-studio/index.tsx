import React, { FC, useEffect, useMemo, useState } from 'react';
import { ConfigurationTree } from '@/configuration-studio/components/configuration-tree';
import { Divider, Splitter, Layout } from 'antd';
import { WorkArea } from '@/configuration-studio/components/work-area';
import { NewButton } from '@/configuration-studio/components/new-button';
import { ConfigurationItemMenu } from '@/configuration-studio/components/item-menu';
import { ConfigurationStudioProvider } from '@/configuration-studio/cs/contexts';

import { useStyles } from './styles';
import Image from 'next/image';
import { UserProfileBlock } from './components/user-profile-dropdown';
import { withAuth } from '@/hocs/withAuth';
import { QuickInfoIcons } from './components/quick-info-icons';
import { ItemToolbarHolder } from './components/item-toolbar-holder';
import { DocumentDefinitionRegistration } from './document-definitions/documentDefinitionRegistration';
import { SheshaDocumentDefinitions } from './document-definitions';
import { useCanvas } from '@/providers';
import { InitializationErrorsModal } from './components/initializationErrorsModal';
import { throttle } from 'lodash';

// Width of the collapsed tree panel (just enough to show the expand toggle), matches the builder's collapsed sidebar.
const COLLAPSED_TREE_SIZE = 35;

const ConfigurationStudio: FC = () => {
  const { styles } = useStyles();
  const canvas = useCanvas();
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  // Live size of the tree panel (in px) while expanded. `undefined` lets the Splitter use its defaultSize.
  const [expandedTreeSize, setExpandedTreeSize] = useState<number | undefined>(undefined);

  // While collapsed we force the thin strip; otherwise we leave the panel uncontrolled (undefined)
  // until the user drags, so the Splitter keeps full drag-resize behaviour.
  const treePanelSize = treeCollapsed ? COLLAPSED_TREE_SIZE : expandedTreeSize;

  const handleTreeResize = (sizes: number[]): void => {
    const treeSize = sizes[0] ?? 0;
    if (treeSize <= COLLAPSED_TREE_SIZE) {
      setTreeCollapsed(true);
    } else {
      setTreeCollapsed(false);
      setExpandedTreeSize(treeSize);
    }
  };

  const throttledTreeResize = useMemo(() => throttle(handleTreeResize, 100), []);

  useEffect(() => {
    return () => {
      throttledTreeResize.cancel();
    };
  }, [throttledTreeResize]);

  const toggleTreeCollapsed = (): void => {
    setTreeCollapsed((prev) => !prev);
  };

  return (
    <ConfigurationStudioProvider>
      <DocumentDefinitionRegistration definitions={SheshaDocumentDefinitions} />

      <Layout className={styles.configStudio}>
        <Layout.Header className={styles.csHeader}>
          <div className={styles.csHeaderLeft}>
            <Image
              src="/favicon.ico"
              alt="Shesha"
              width={32}
              height={32}
              className={styles.csLogo}
            />
            <NewButton />
          </div>
          <div className={styles.csHeaderCenter}>
            <ConfigurationItemMenu />
            <QuickInfoIcons />
          </div>
          <div className={styles.csHeaderRight}>
            <ItemToolbarHolder />
            <Divider orientation="vertical" />
            <UserProfileBlock />
          </div>
        </Layout.Header>
        <Layout.Content className={styles.csContent}>
          <Splitter
            onResize={throttledTreeResize}
            onResizeEnd={(sizes) => {
              throttledTreeResize.cancel();
              handleTreeResize(sizes);
              canvas.setConfigTreePanelSize(sizes[0] ?? 0);
            }}
          >
            <Splitter.Panel
              min={treeCollapsed ? COLLAPSED_TREE_SIZE : '5%'}
              defaultSize="20%"
              {...(treePanelSize !== undefined ? { size: treePanelSize } : {})}
              className={styles.csTreeArea}
            >
              <ConfigurationTree collapsed={treeCollapsed} onToggleCollapsed={toggleTreeCollapsed} />
            </Splitter.Panel>
            <Splitter.Panel
              min="20%"
              className={styles.csWorkArea}
            >
              <WorkArea />
            </Splitter.Panel>
          </Splitter>
        </Layout.Content>
      </Layout>
      <InitializationErrorsModal />
    </ConfigurationStudioProvider>
  );
};

export default withAuth(ConfigurationStudio);
