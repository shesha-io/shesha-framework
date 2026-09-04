import { SplitLayout } from '@/components/splitLayout';
import { ConfigurationTree } from '@/configuration-studio/components/configuration-tree';
import { ConfigurationItemMenu } from '@/configuration-studio/components/item-menu';
import { NewButton } from '@/configuration-studio/components/new-button';
import { WorkArea } from '@/configuration-studio/components/work-area';
import { ConfigurationStudioProvider } from '@/configuration-studio/cs/contexts';
import { withAuth } from '@/hocs/withAuth';
import { Divider, Layout } from 'antd';
import Image from 'next/image';
import { FC } from 'react';
import { InitializationErrorsModal } from './components/initializationErrorsModal';
import { ItemToolbarHolder } from './components/item-toolbar-holder';
import { QuickInfoIcons } from './components/quick-info-icons';
import { UserProfileBlock } from './components/user-profile-dropdown';
import { SheshaDocumentDefinitions } from './document-definitions';
import { DocumentDefinitionRegistration } from './document-definitions/documentDefinitionRegistration';
import { useStyles } from './styles';
import { useLocalStorage } from '@/hooks';
import { CustomErrorBoundary } from '../components';

const ConfigurationStudio: FC = () => {
  const { styles } = useStyles();
  const [treeCollapsed, setTreeCollapsed] = useLocalStorage('shesha:cs-tree-collapsed', false);
  const [treePinned, setTreePinned] = useLocalStorage('shesha:cs-tree-pinned', true);
  const defaultTreePanelSize = typeof window !== 'undefined' ? (20 / 100) * window.innerWidth : 350;

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
          <SplitLayout
            orientation="horizontal"
            position="start"
            panelTitle="Explorer"
            panelClassName={styles.csTreeArea}
            panel={<CustomErrorBoundary><ConfigurationTree /></CustomErrorBoundary>}
            panelMin={100}
            panelMax="50%"

            defaultPanelSize={defaultTreePanelSize}
            defaultExpanded={!treeCollapsed && treePinned}
            onExpandedToggle={(expanded) => setTreeCollapsed(!expanded)}
            defaultPinned={treePinned}
            onPinnedToggle={(pinned) => setTreePinned(pinned)}
          >
            <WorkArea />
          </SplitLayout>
        </Layout.Content>
      </Layout>
      <InitializationErrorsModal />
    </ConfigurationStudioProvider>
  );
};

export default withAuth(ConfigurationStudio);
