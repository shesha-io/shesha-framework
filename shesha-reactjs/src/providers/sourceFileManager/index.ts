/*
Source files folder structure:
    root/
    ├── entities/
    │   └── shesha/
    │   │   ├── person.d.ts
    │   │   └── address.d.ts
    │   └── dsdNpo/
    │       ├── organisation.json
    │       └── changeRequest.json
    ├── forms/
    │   └── shesha/
    │       ├── person-create/
    │       │   ├── model.d.ts
    │       │   ├── button1/                    <-- folder that contains all JS configurations of the button settings
    │       │   │   ├── style.js                <-- simple property: style of the button configured via JS configuration
    │       │   │   ├── style.variables.d.ts    <-- list of exposed variables (generated)
    │       │   │   └── actionConfiguration/        <-- complex propertyconfigurable action configuration
    │       │   │       ├── action1.js              <-- configuration of the script action. todo: decide how to indetify the task 
    │       │   │       ├── action1.variables.d.ts  <-- list of exposed variables (generated)
    │       │   │       └── action2.js
    │       │   └── checkBox1/
    │       │       └── disabled.js
    │       │   └── buttonGroup1/
    │       │       ├── style.js    
    │       │       └── buttons/
    │       │           ├── button1/
    │       │           │   ├── style.js
    │       │           │   └── actionConfiguration/
    │       │           │       ├── action1.js
    │       │           │       └── action2.js
    │       │           └── button2/
    │       │               ├── style.js
    │       │               └── actionConfiguration/
    │       │                   └── action1.js
    │       └── address-create/
    │           └── model.d.ts
    ├── apis/
    │    ├── applicationApi.ts
    │    ├── userApi.ts
    │    ├── formApi.ts
    │    └── settingsApi.ts
    └── ...
*/