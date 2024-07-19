import { IKeyInformationBarProps } from "@/designer-components/keyInformationBar/interfaces"
import { nanoid } from "@/utils/uuid"
import { add } from "lodash"
import { Key } from "react"

const labelText = ({ label }) => ({
    "code": false,
    "copyable": false,
    "delete": false,
    "ellipsis": false,
    "mark": false,
    "italic": false,
    "underline": false,
    "level": 1,
    "textType": "span",
    "id": "qwdQWZBQPr6l4F7RG6GjcYL7IxHg6A",
    "type": "text",
    "propertyName": "text3",
    "componentName": "text3",
    "label": "Text3",
    "labelAlign": "right",
    "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
    "hidden": false,
    "isDynamic": false,
    "version": 2,
    "contentDisplay": "content",
    "textAlign": "start",
    "content": label,
    "dataType": "string",
    "contentType": [
        ""
    ],
    "padding": "none"
})

const textInput = ({ propertyName, addonAfter }) => ({
    "textType": "text",
    "id": "hv1zhwYPKTYLg1PzomPMM3_dukJ5wZ",
    "type": "textField",
    "propertyName": propertyName,
    "componentName": "textField4",
    "label": "",
    "addonAfter": addonAfter,
    "labelAlign": "right",
    "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
    "hidden": false,
    "isDynamic": false,
    "version": 4,
    "validate": {},
    "style": "return {\n    width: '50px',\n    height: '24px'\n}",
})

export const getColumn = () => ([
    {
        "id": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
        "width": "120",
        "type": 'container',
        "textAlign": "start",
        "flexDirection": "row",
        "components": [
            {
                "id": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                "type": "container",
                "propertyName": "container6",
                "componentName": "container6",
                "label": "Container6",
                "labelAlign": "right",
                "parentId": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
                "hidden": false,
                "isDynamic": false,
                "version": 3,
                "direction": "vertical",
                "justifyContent": "left",
                "display": "flex",
                "flexWrap": "nowrap",
                "components": [
                    {
                        "code": false,
                        "copyable": false,
                        "delete": false,
                        "ellipsis": false,
                        "mark": false,
                        "italic": false,
                        "underline": false,
                        "level": 1,
                        "textType": "span",
                        "id": "qwdQWZBQPr6l4F7RG6GjcYL7IxHg6A",
                        "type": "text",
                        "propertyName": "text3",
                        "componentName": "text3",
                        "label": "Text3",
                        "labelAlign": "right",
                        "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                        "hidden": false,
                        "isDynamic": false,
                        "version": 2,
                        "contentDisplay": "content",
                        "textAlign": "start",
                        "content": "Width",
                        "dataType": "string",
                        "contentType": [
                            ""
                        ],
                        "padding": "none"
                    },
                    {
                        "textType": "text",
                        "id": "hv1zhwYPKTYLg1PzomPMM3_dukJ5wZ",
                        "type": "textField",
                        "propertyName": "textField4",
                        "componentName": "textField4",
                        "label": "",
                        "labelAlign": "right",
                        "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                        "hidden": false,
                        "isDynamic": false,
                        "version": 4,
                        "validate": {},
                        "style": "return {\n    width: '50px',\n    height: '24px'\n}",
                        "size": "small"
                    }
                ],
                "gap": "8px",
                "flexDirection": "row"
            }
        ],
        "padding": "0px"
    },
    {
        "id": "TTeMNUJuDyAPqxfwbHdTzayNHrAqVQ",
        "width": "120",
        "textAlign": "start",
        "flexDirection": "row",
        "components": [],
        "padding": "0px"
    }
])


export const props = ({
    id: "YO5J1DzC_eFLLh8uWCqOHbAEYoU4nf",
    type: "KeyInformationBar",
    propertyName: "column 1",
    "componentName": "keyInformationBar1",
    "label": "Key Information Bar1",
    "labelAlign": "right",
    "parentId": "LTpAs5bjBJSvHv4nGBSJv",
    "hidden": false,
    "isDynamic": false,
    columns: [
        {
            "id": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
            "width": "120",
            "textAlign": "start",
            "flexDirection": "row",
            "components": [
                {
                    "id": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                    "type": "container",
                    "propertyName": "container6",
                    "componentName": "container6",
                    "label": "Container6",
                    "labelAlign": "right",
                    "parentId": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
                    "hidden": false,
                    "isDynamic": false,
                    "version": 3,
                    "direction": "vertical",
                    "justifyContent": "left",
                    "display": "flex",
                    "flexWrap": "nowrap",
                    "components": [
                        {
                            "code": false,
                            "copyable": false,
                            "delete": false,
                            "ellipsis": false,
                            "mark": false,
                            "italic": false,
                            "underline": false,
                            "level": 1,
                            "textType": "span",
                            "id": "qwdQWZBQPr6l4F7RG6GjcYL7IxHg6A",
                            "type": "text",
                            "propertyName": "text3",
                            "componentName": "text3",
                            "label": "Text3",
                            "labelAlign": "right",
                            "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                            "hidden": false,
                            "isDynamic": false,
                            "version": 2,
                            "contentDisplay": "content",
                            "textAlign": "start",
                            "content": "Width",
                            "dataType": "string",
                            "contentType": [
                                ""
                            ],
                            "padding": "none"
                        },
                        {
                            "textType": "text",
                            "id": "hv1zhwYPKTYLg1PzomPMM3_dukJ5wZ",
                            "type": "textField",
                            "propertyName": "textField4",
                            "componentName": "textField4",
                            "label": "",
                            "labelAlign": "right",
                            "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                            "hidden": false,
                            "isDynamic": false,
                            "version": 4,
                            "validate": {},
                            "style": "return {\n    width: '50px',\n    height: '24px'\n}",
                            "size": "small"
                        }
                    ],
                    "gap": "8px",
                    "flexDirection": "row"
                }
            ],
            "padding": "0px"
        },
        {
            "id": "TTeMNUJuDyAPqxfwbHdTzayNHrAqVQ",
            "width": "120",
            "textAlign": "start",
            "flexDirection": "row",
            "components": [],
            "padding": "0px"
        }
    ],
    "orientation": "horizontal",
    "version": 1,
    "components": [
        {
            "id": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
            "width": 200,
            "textAlign": "center",
            "flexDirection": "column",
            "components": [
                {
                    "id": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                    "type": "container",
                    "propertyName": "container6",
                    "componentName": "container6",
                    "label": "Container6",
                    "labelAlign": "right",
                    "parentId": "6Sh6RHtAvs4mezez3RuzgOz85Z606N",
                    "hidden": false,
                    "isDynamic": false,
                    "version": 3,
                    "direction": "vertical",
                    "justifyContent": "left",
                    "display": "flex",
                    "flexWrap": "nowrap",
                    "components": [
                        {
                            "code": false,
                            "copyable": false,
                            "delete": false,
                            "ellipsis": false,
                            "mark": false,
                            "italic": false,
                            "underline": false,
                            "level": 1,
                            "textType": "span",
                            "id": "qwdQWZBQPr6l4F7RG6GjcYL7IxHg6A",
                            "type": "text",
                            "propertyName": "text3",
                            "componentName": "text3",
                            "label": "Text3",
                            "labelAlign": "right",
                            "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                            "hidden": false,
                            "isDynamic": false,
                            "version": 2,
                            "contentDisplay": "content",
                            "textAlign": "start",
                            "content": "Width",
                            "dataType": "string",
                            "contentType": [
                                ""
                            ],
                            "padding": "none"
                        },
                        {
                            "textType": "text",
                            "id": "hv1zhwYPKTYLg1PzomPMM3_dukJ5wZ",
                            "type": "textField",
                            "propertyName": "textField4",
                            "componentName": "textField4",
                            "label": "",
                            "labelAlign": "right",
                            "parentId": "9Jq7pHtVZEwnk09EUBvprwM8VYoWA2",
                            "hidden": false,
                            "isDynamic": false,
                            "version": 4,
                            "validate": {},
                            "style": "return {\n    width: '50px',\n    height: '24px'\n}",
                            "size": "small"
                        }
                    ],
                    "gap": "8px",
                    "flexDirection": "row"
                }
            ],
            "padding": "0px",
            "parentId": "YO5J1DzC_eFLLh8uWCqOHbAEYoU4nf"
        }
    ],
    "dividerHeight": 0,
    "dividerThickness": 0,
    "dividerMargin": 0,
    "readOnly": true
}) as any