import React, { FC } from 'react';
import { ConfigurationTree } from '@/configuration-studio/components/configuration-tree';
import { Divider, Splitter } from 'antd';
import { WorkArea } from '@/configuration-studio/components/workArea';
import { NewButton } from '@/configuration-studio/components/new-button';
import { ConfigurationItemMenu } from '@/configuration-studio/components/item-menu';
import { ConfigurationStudioProvider } from '@/configuration-studio/cs/contexts';
import { Layout } from 'antd';
import { useStyles } from './styles';
import Image from 'next/image';
import { UserProfileBlock } from './components/user-profile-dropdown';
import { withAuth } from '@/hocs/withAuth';
import { QuickInfoIcons } from './components/quick-info-icons';
import { ItemToolbarHolder } from './components/item-toolbar-holder';
import { DocumentDefinitionRegistration } from './document-definitions/documentDefinitionRegistration';
import { SheshaDocumentDefinitions } from './document-definitions';
import { useCanvas } from '@/providers';
const ConfigurationStudio: FC = () => {
  const { styles } = useStyles();
  const canvas = useCanvas();

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
            <Divider type="vertical" />
            <UserProfileBlock />
          </div>
        </Layout.Header>
        <Layout.Content className={styles.csContent}>
          <Splitter onResizeEnd={(sizes) => {
            canvas?.setConfigTreePanelSize(sizes[0] || 0);
          }}
          >
            <Splitter.Panel
              collapsible
              min="5%"
              defaultSize="20%"
              className={styles.csTreeArea}
            >
              <ConfigurationTree />
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
    </ConfigurationStudioProvider>
  );
};

export default withAuth(ConfigurationStudio);
