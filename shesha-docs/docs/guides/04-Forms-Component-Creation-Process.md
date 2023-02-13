# Forms Component Creation Process

## Getting Started

In this tutorial we will introduce you to Forms Component Creation Process and how to get it set up. 

## Creating a Simple Component

Now that we have successfully cloned and run the application and successfully navigated to Storybook its time to create a new simple component.

We will begin by creating a new component within Shesha React JS. Depending on your IDE this can be done in numerous ways, but for the example we will create a component using Microsoft's Visual Studio Code. 

Lets begin by creating a new folder in React JS components which we'll call 'inputComponent'

We'll need to create two new files within the newly created folder. 

``` shell
index.tsx,
```


and


``` shell
index.stories.tsx,
```


Now lets navigate to the 'index.tsx' file within the newly created component. We will add the following code to the file:


``` shell
import React, { FC } from 'react';
import { Input } from 'antd';

export interface IInputComponentProps {}

/**
A Basic Input Component for Documentation
 */

export const InputComponent: FC<IInputComponentProps> = ({}) => {
  return <Input placeholder="Basic usage" />;
};

export default InputComponent;
```

Once that is done we will add the following code to the 'index.stories.tsx' file: 

``` shell
import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import InputComponent, { IInputComponentProps } from '.';

export default {
  title: 'Components/TestInputComponent',
  component: InputComponent,
  argTypes: {},
} as Meta;

// Create a master template for mapping args to render the Input component
const Template: Story<IInputComponentProps> = args => <InputComponent {...args} />;

// Reuse that template for creating different stories
export const Basic = Template.bind({});
Basic.args = {};
```


Now Lets save both files and run the following command:


``` shell
npm run storybook
```


We can now navigate to Storybook and see the following component has successfully been created and is being displayed within Storybook. 

## Render the component in the forms toolbar (Builder Widgets)

These next steps will help you create the Builder Widget, link it to your created component and display it in the forms toolbar.

Lets begin by creating a new folder in the following location: 


``` shell
components/formDesigner/components
```

We'll name the folder "inputComponent" and create a new file within the folder titled "index.tsx".

Lets paste the following code into the newly created index.tsx file.

``` shell
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { BgColorsOutlined } from '@ant-design/icons';
import React from 'react';
import InputComponent, { IInputComponentProps } from '../../../inputComponent';
import _ from 'lodash';

interface IStatisticComponentProps extends IInputComponentProps, IConfigurableFormComponent {}

const ShaInputComponent: IToolboxComponent<IStatisticComponentProps> = {
  type: 'InputComponent',
  name: 'InputComponent',
  icon: <BgColorsOutlined />,
  factory: (model: IStatisticComponentProps) => {
    const {} = model;

    return <InputComponent />;
  },
};

export default ShaInputComponent;

```
Once we have pasted this and saved it, its now time to navigate to the toolboxComponents.ts file which can be located here:


``` shell
src\providers\form\defaults\toolboxComponents.ts
```

Once at the toolboxCOmponent file we'll need to add the following two lines of code, the first line we add the import to the imports section.


``` shell
import InputComponent from '../../../components/formDesigner/components/inputComponent';
```

This next line we add in the 'Basic' area just underneath the last item in the array.


``` shell
InputComponent,
```

Once this is done, we can save all the files and we can navigate to 'TestFormsDesigner' on storybook to see the component added to the Builder Widgets.


## Render the components properties in the properties window

Next step is to have some properties added to the component so when we add it to the form designer we can customise some properties. 

Lets begin this by creating a new file inside the 'inputComponent' folder located within the 'formDesigner' components. 

``` shell
settingsForm.json
```

Within the settingsForm.json lets add the following code:

``` shell
{
  "components": [
    {
      "id": "38f7aff0-756e-4282-a5c4-39748219a225",
      "type": "sectionSeparator",
      "name": "separator1",
      "parentId": "root",
      "label": "Display"
    },
    {
      "id": "de0f8d68-de60-4ec6-9290-d9cfffa5bcbc",
      "type": "textField",
      "name": "name",
      "parentId": "root",
      "label": "Name",
      "required": true,
      "validate": {
        "required": true
      }
    },
    {
      "id": "5e97d29b-9a47-4ca3-9990-7020de1de392",
      "type": "textField",
      "name": "title",
      "parentId": "root",
      "label": "Title",
      "required": true,
      "validate": {
        "required": true
      }
    },
    {
      "id": "c8a2b2ce-3aef-46f9-a1f6-1c04417e7d20",
      "type": "iconPicker",
      "name": "prefix",
      "label": "Prefix Icon",
      "labelAlign": "right",
      "parentId": "root",
      "hidden": false,
      "customVisibility": "",
      "settingsValidationErrors": []
    },
    {
      "id": "03e87c35-dc6a-4095-9492-2eede94f8dbe",
      "type": "iconPicker",
      "name": "suffix",
      "label": "Suffix Icon",
      "labelAlign": "right",
      "parentId": "root",
      "hidden": false,
      "customVisibility": "",
      "settingsValidationErrors": []
    },
    {
      "id": "ba5a5ebd-55ed-4c4c-adc7-35c591c8fd4e",
      "type": "sectionSeparator",
      "name": "separatorVisibility",
      "parentId": "root",
      "label": "Visibility"
    },
    {
      "id": "c6f46a6a-4a14-4aa3-af3d-938e2a24dee3",
      "type": "codeEditor",
      "name": "customVisibility",
      "label": "Custom Visibility",
      "labelAlign": "right",
      "parentId": "root",
      "hidden": false,
      "customVisibility": null,
      "description": "Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
      "validate": {},
      "settingsValidationErrors": []
    }
  ],
  "formSettings": {
    "layout": "horizontal",
    "colon": true,
    "labelCol": {
      "span": 5
    },
    "wrapperCol": {
      "span": 13
    },
    "displayName": "DEFAULT_FORM_SETTINGS",
    "__docgenInfo": {
      "description": "Default form settings",
      "displayName": "DEFAULT_FORM_SETTINGS",
      "props": {}
    }
  }
}

```

Once this is done, we can save an navigate back to the 'index.tsx' file located within the same folder. 

Replace all code with the following: 

``` shell
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { BgColorsOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import InputComponent, { IInputComponentProps } from '../../../inputComponent';
import ShaIcon from '../../../shaIcon';
import { useForm } from '../../../../providers';
import _ from 'lodash';

const settingsForm = settingsFormJson as FormMarkup;

interface IStatisticComponentProps extends IInputComponentProps, IConfigurableFormComponent {}

const ShaInputComponent: IToolboxComponent<IStatisticComponentProps> = {
  type: 'InputComponent',
  name: 'InputComponent',
  icon: <BgColorsOutlined />,
  factory: (model: IStatisticComponentProps) => {
    const { prefix, suffix, name } = model;
    const { formData } = useForm();

    const getDisplayValue = (prop: string) => {
      if (!formData || !prop) return undefined;

      const value = _.get(formData, model?.name);

      return typeof value === 'object' ? null : _.get(formData, model?.name);
    };

    return <InputComponent />;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ShaInputComponent;

```

Save your changes and navigate back to the TestFormDesigner on Storybook, add your InputCOmponent and you will see properties on the right appear now. 
