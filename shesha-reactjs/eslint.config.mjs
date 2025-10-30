/* eslint-disable no-console */
import jsdoc from "eslint-plugin-jsdoc";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import { importX, createNodeResolver } from 'eslint-plugin-import-x'
import memoryTracePlugin from "./src/eslint-plugins/eslint-plugin-memory-monitor.js";
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isLightBuild = process.env.SHA_LIGHT_BUILD === "1" ? true : false;
console.log(`Light build is: ${Boolean(isLightBuild) ? "🔛 ON" : "📴 OFF"}`);

const strictFolders = isLightBuild
    ? []
    : [
        "src/configuration-studio",
        //"src/utils",

        "src/providers/referenceListDispatcher",
        "src/providers/metadataDispatcher",
        "src/providers/metadata",
        "src/providers/configurationItemsLoader",
        "src/providers/formPersisterProvider",
        "src/providers/formMarkupConverter",
        "src/providers/formManager",
        "src/providers/configurableActionsDispatcher",
        "src/providers/auth",
        "src/providers/appConfigurator",
        "src/providers/dataContextManager",
        "src/providers/dataContextProvider",
        //"src/providers/sheshaApplication",
        //"src/providers/form/utils",
        "src/hooks",
        "src/designer-components/_settings/utils/background",
    ];

const stylisticOverrides = {
    ...stylistic.configs.recommended.rules,
    "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": false }],
    "@stylistic/jsx-indent-props": [
        'error',
        2
        // - 'first' - align with first prop (VS Code-like)
        // - 2 - 2 space indentation (most common)
        // - 4 - 4 space indentation  
        // - 'tab' - use tab characters
    ],
    "@stylistic/jsx-one-expression-per-line": "off",
    "@stylistic/semi": ["error", "always"],
    "@stylistic/type-annotation-spacing": "error",
    "@stylistic/quotes": "off",
    "@stylistic/member-delimiter-style": ["error", {
        multiline: {
            delimiter: "semi",
            requireLast: true,
        },

        singleline: {
            delimiter: "semi",
            requireLast: false,
        },
    }],
    //"@stylistic/indent-binary-ops": "off",
    /*
    "@stylistic/indent-binary-ops": ["error", 2],
    */
    "@stylistic/jsx-quotes": ["error", "prefer-double"],
    "@stylistic/eol-last": "error",
    "@stylistic/space-before-blocks": "error",
    "@stylistic/arrow-parens": ["error", "always"],
    "@stylistic/spaced-comment": ["error", "always", { "markers": ["/", "#region", "#endregion"] }],
    "@stylistic/operator-linebreak": ["error", "after", { "overrides": { "?": "before", ":": "before" } }],
    "@stylistic/no-trailing-spaces": "error",
    "@stylistic/comma-dangle": ["error", "always-multiline"],
    "@stylistic/padded-blocks": ["error", "never"],
    "@stylistic/no-multiple-empty-lines": "error",
    "@stylistic/lines-between-class-members": ["error", "always"],
    "indent": "off",
    "@stylistic/indent": ["error", 2, {
        "SwitchCase": 1,
    }],
    "@stylistic/space-infix-ops": "error",
    "@stylistic/multiline-ternary": "off",
    //"@stylistic/multiline-comment-style": "error",
    "@stylistic/object-curly-spacing": ["error", "always"],
    "@stylistic/jsx-curly-spacing": ["error", { "when": "never", "attributes": { "allowMultiline": false, "when": "never" }, "children": true }],
};

const legacyTypescriptOverrides = {
    "@typescript-eslint/dot-notation": "off",


    "@typescript-eslint/explicit-function-return-type": ["error", {
        "allowExpressions": true,
        "allowHigherOrderFunctions": true,
        "allowDirectConstAssertionInArrowFunctions": true
    }],

    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/indent": "off",

    "@typescript-eslint/naming-convention": ["error", {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "forbid",
        trailingUnderscore: "forbid",
    }],

    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-unused-expressions": "error",

    "@typescript-eslint/no-unused-vars": ["error", {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
    }],

    "@typescript-eslint/no-use-before-define": ["error", {
        ignoreTypeReferences: true,
        classes: false,
    }],

    "@typescript-eslint/quotes": ["off", "double"],

    "@typescript-eslint/typedef": ["off", {
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true,
    }],
    "@typescript-eslint/no-empty-object-type": "error",
    // TODO: activate and review code
    // "@typescript-eslint/no-explicit-any": "error",
    // "@typescript-eslint/no-unsafe-call": "error",
    // "@typescript-eslint/no-unsafe-member-access": "error",
    // "@typescript-eslint/no-unsafe-argument": "error",
    // "@typescript-eslint/no-unsafe-assignment": "error",
};

const typescriptOverrides = {
    "@typescript-eslint/no-unused-vars": ["error", {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
    }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
            "allowExpressions": true,
            "allowHigherOrderFunctions": true,
            "allowDirectConstAssertionInArrowFunctions": true
        }
    ],

    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    //todo: enable after first part of fixes 
    // "@typescript-eslint/strict-boolean-expressions": "error",
};

const baseTsConfig = {
    ...importX.flatConfigs.recommended,
    ...importX.flatConfigs.typescript,
    files: [
        "src/**/*.ts",
        "src/**/*.tsx",
    ],
    ignores: [
        "src/apis/*",
        "**/__tests__/**/*",
    ],
    plugins: {
        "memory-monitor": memoryTracePlugin,
        jsdoc,
        "react": reactPlugin,
        "react-hooks": hooksPlugin,
        "@typescript-eslint": typescriptEslint,
        "@stylistic": stylistic,
        "import-x": importX,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            projectService: true, // Enable project service
            tsconfigRootDir: __dirname,
        },
    },

    settings: {
        react: {
            createClass: "createReactClass",
            pragma: "React",
            fragment: "Fragment",
            version: "detect",
            flowVersion: "0.53",
        },

        propWrapperFunctions: ["forbidExtraProps", {
            property: "freeze",
            object: "Object",
        }, {
                property: "myFavoriteWrapper",
            }, {
                property: "forbidExtraProps",
                exact: true,
            }],

        componentWrapperFunctions: ["observer", {
            property: "styled",
        }, {
                property: "observer",
                object: "Mobx",
            }, {
                property: "observer",
                object: "<pragma>",
            }],

        formComponents: ["CustomForm", {
            name: "Form",
            formAttribute: "endpoint",
        }],

        linkComponents: ["Hyperlink", {
            name: "Link",
            linkAttribute: "to",
        }],

        'import-x/resolver-next': [
            createTypeScriptImportResolver(
                {
                    alwaysTryTypes: true,
                    project: [
                        'tsconfig.json',
                    ],
                    tsconfigRootDir: __dirname,
                }
            ),
            createNodeResolver(
                {
                    extensions: ['.ts', '.tsx'],
                }
            ),
        ],
    },

    rules: {
        "no-restricted-globals": [
            "error",
            {
                "name": "module",
                "message": "Avoid using module global, use ES6 modules instead"
            }
        ],
        "memory-monitor/track-memory": "off",
        ...hooksPlugin.configs.recommended.rules,
        ...reactPlugin.configs.recommended.rules,
        ...importX.flatConfigs.recommended.rules,
        ...importX.flatConfigs.typescript.rules,

        "react/prop-types": ["off"],
        "require-await": "error",
        "no-restricted-imports": ["error", {
            paths: ["@/utils/publicUtils",
                {
                    name: "nanoid/non-secure",
                    message: "Please import nanoid from `@/utils/uuid` instead.",
                },
                {
                    name: "nanoid",
                    message: "Please import nanoid from `@/utils/uuid` instead.",
                },
                {
                    name: "antd",
                    importNames: ["message"],
                    message: "Please get `message` via the App instead, see example: const { message } = App.useApp();",
                }, {
                    name: "antd",
                    importNames: ["notification"],
                    message: "Please get `notification` via the App instead, see example: const { notification } = App.useApp();",
                }],
        }],

        "sort-imports": ["off", {
            ignoreCase: false,
            ignoreDeclarationSort: false,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
            allowSeparatedGroups: false,
        }],

        "brace-style": ["error", "1tbs"],
        "capitalized-comments": ["off", "never"],
        curly: "off",
        "dot-notation": "off",
        "eol-last": "off",
        eqeqeq: ["error", "smart"],
        "guard-for-in": "error",
        "id-denylist": "off",
        "id-match": "off",
        "indent": "off",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "off",

        "max-len": ["error", {
            code: 300,
        }],

        "no-bitwise": "error",
        "no-caller": "error",

        "no-console": ["error", {
            allow: [
                "warn",
                "dir",
                "timeLog",
                "assert",
                "clear",
                "count",
                "countReset",
                "group",
                "groupEnd",
                "table",
                "dirxml",
                "error",
                "groupCollapsed",
                "Console",
                "profile",
                "profileEnd",
                "timeStamp",
                "context",
            ],
        }],

        "no-debugger": "error",
        "no-empty": "error",
        "no-empty-function": "off",
        "no-eval": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-trailing-spaces": "off",
        "no-underscore-dangle": "off",
        "no-unused-expressions": "off",
        "no-unused-labels": "error",
        "no-unused-vars": "off",
        "no-use-before-define": "off",
        quotes: "off",
        radix: "error",
        semi: "off",

        "spaced-comment": ["off", "always", {
            markers: ["/"],
        }],
        "import-x/no-cycle": ["error", { maxDepth: Infinity }],
        "import-x/no-duplicates": "error",
        "import-x/no-self-import": "error",
        "import-x/no-unresolved": "error",
    }
};

const makeStrictConfig = (path) => {
    return {
        ...baseTsConfig,
        files: [
            `${path}/**/*.ts`,
            `${path}/**/*.tsx`,
        ],
        languageOptions: {
            ...baseTsConfig.languageOptions,
            parserOptions: {
                projectService: true, // Enable project service
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            ...baseTsConfig.rules,
            ...typescriptEslint.configs.recommended.rules,
            ...typescriptOverrides,
            ...stylisticOverrides,

            "react-hooks/exhaustive-deps": "error",
            "no-unsafe-optional-chaining": "error",
        },
    };
}

export default [
    {
        ...baseTsConfig,
        files: [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        ignores: [...baseTsConfig.ignores, ...strictFolders.map(f => `${f}/**/*`)],
        rules: {
            ...baseTsConfig.rules,
            ...legacyTypescriptOverrides,
            ...stylisticOverrides,
        }
    },
    ...strictFolders.map(f => makeStrictConfig(f)),
    {
        files: ['**/*.js', '**/*.mjs'],
        ignores: [
            "dist/**",
            ".next/**",
            "src/rollup-plugins/**",
            "server.js",
        ],
        ...js.configs.recommended,
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
        plugins: {
            'import-x': importX,
        },
        rules: {
            ...importX.flatConfigs.recommended.rules,
            "import-x/no-cycle": ["error", { maxDepth: Infinity }],
            "no-console": "error",
            '@typescript-eslint/no-var-requires': 'off', // Allow require() in JS files
        }
    },
];