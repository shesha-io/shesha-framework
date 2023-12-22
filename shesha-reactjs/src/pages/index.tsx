import { CollapsiblePanel } from '@/components/index';
import { getLayout } from '@/components/mainLayout/index';
import { PageWithLayout } from '@/interfaces';
import { Alert } from 'antd';
import React from 'react';
import styled from 'styled-components';

const StyledAlert = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: PageWithLayout<{}> = () => {
  return (
    <CollapsiblePanel header="Plugins">
      <StyledAlert message="This is a list of plugins the boilerplate uses" type="info" />
    </CollapsiblePanel>
  );
};

export default Home;

Home.getLayout = getLayout;