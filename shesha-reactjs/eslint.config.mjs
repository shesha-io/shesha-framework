import { fixupConfigRules } from "@eslint/compat";
import jsdoc from "eslint-plugin-jsdoc";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    files: [
        "**/*.ts",
        "**/*.tsx",
    ],
    ignores: [
        ".next/**/*",
        "dist/**/*",
        ".out/**/*",
        "node_modules/**/*",
        "example/**/*",
        "src/apis/*",
        "**/__tests__/**/*",
        "**/.eslintrc.js",
        "**/rollup.config.mjs",
        "**/next.config.js",
        "**/jest.config.js",
    ],
}, ...fixupConfigRules(
    compat.extends("plugin:@next/next/recommended"),
), {
    plugins: {
        jsdoc,
        "react-hooks": hooksPlugin,
        "@typescript-eslint": typescriptEslint,
        "@stylistic": stylistic,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
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

        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".json"],
            },
        },

        "import/extensions": [".js", ".mjs", ".jsx"],
        "import/core-modules": [],
        "import/ignore": ["node_modules", "\\.(coffee|scss|css|less|hbs|svg|json)$"],
    },

    rules: {
        ...hooksPlugin.configs.recommended.rules,
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

        // TODO: activate and review code
        // "@typescript-eslint/no-explicit-any": "error",
        // "@typescript-eslint/no-unsafe-call": "error",
        // "@typescript-eslint/no-unsafe-member-access": "error",
        // "@typescript-eslint/no-unsafe-argument": "error",
        // "@typescript-eslint/no-unsafe-assignment": "error",

        "@typescript-eslint/dot-notation": "off",

        "@typescript-eslint/explicit-function-return-type": ["off", {
            allowExpressions: false,
            allowTypedFunctionExpressions: false,
            allowHigherOrderFunctions: false,
            allowDirectConstAssertionInArrowFunctions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        }],

        "@typescript-eslint/explicit-module-boundary-types": ["off", {
            allowArgumentsExplicitlyTypedAsAny: true,
            allowDirectConstAssertionInArrowFunctions: true,
            allowHigherOrderFunctions: false,
            allowTypedFunctionExpressions: false,
        }],

        "@typescript-eslint/indent": "off",

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
        "@stylistic/semi": ["error", "always"],
        "@stylistic/type-annotation-spacing": "error",

        "@typescript-eslint/typedef": ["off", {
            parameter: true,
            propertyDeclaration: true,
            variableDeclaration: true,
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
        indent: "off",
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
    }
}
];