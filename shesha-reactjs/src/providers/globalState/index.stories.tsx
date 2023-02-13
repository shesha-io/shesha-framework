import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import GlobalStateProvider, { useGlobalState } from '.';
import { Button, notification, Space } from 'antd';
import { IConfigurableFormProps } from '../../components';
import { addStory } from '../../stories/utils';
import StoryApp from '../../components/storyBookApp';

export default {
  title: 'Providers/GlobalState',
  component: GlobalStateProvider,
} as Meta;

const KEY_ONE = 'KEY_ONE';
const KEY_TWO = 'KEY_TWO';

// Create a master template for mapping args to render the Button component
const BasicTemplateInner = () => {
  const { globalState, setState, clearState, getStateByKey } = useGlobalState();

  const getStateOne = () => {
    const state = getStateByKey(KEY_ONE);

    notification.info({ message: KEY_ONE, description: <pre>{JSON.stringify(state, null, 2)}</pre> });
  };

  const getStateTwo = () => {
    const state = getStateByKey(KEY_TWO);

    notification.info({ message: KEY_TWO, description: <pre>{JSON.stringify(state, null, 2)}</pre> });
  };

  return (
    <div>
      <div>
        <Space>
          <Button onClick={() => setState({ key: KEY_ONE, data: { name: 'First State', age: 'Some age' } })}>
            Set State 1
          </Button>
          <Button
            onClick={() =>
              setState({
                key: KEY_TWO,
                data: { name: 'Second State', lastName: 'Last Name', friend: { name: 'Friend' } },
              })
            }
          >
            Set State 2
          </Button>
          <Button onClick={() => clearState(KEY_ONE)}>Clear State 1</Button>
          <Button onClick={() => clearState(KEY_TWO)}>Clear State 2</Button>

          <Button onClick={getStateOne}>Get State 1</Button>
          <Button onClick={getStateTwo}>Get State 2</Button>
        </Space>
      </div>
      <br />
      <div>Below is the state</div>
      <div>
        <pre>{JSON.stringify(globalState, null, 2)}</pre>
      </div>
    </div>
  );
};

const BasicTemplate: Story<IConfigurableFormProps> = () => {
  return (
    <StoryApp>
      <BasicTemplateInner />
    </StoryApp>
  );
};

export const Basic = addStory(BasicTemplate, null);
