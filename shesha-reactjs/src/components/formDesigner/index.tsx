import { FormProviderWrapper } from "./formDesignerWrapper";
import { FormDesignerRenderer } from "./formDesignerRenderer";
import { FC } from "react";
import { FormIdentifier } from "@/interfaces";
import React from "react";

interface IFormDesignerProps {
    formId: FormIdentifier;
  }

const FormDesigner: FC<IFormDesignerProps> = ({ formId }) => {
    return (
        <FormProviderWrapper formId={formId}>
            <FormDesignerRenderer />
        </FormProviderWrapper>
    );
};

type InternalFormDesignerType = typeof FormDesigner;
interface IInternalFormDesignerInterface extends InternalFormDesignerType {
    Visual: typeof FormDesignerRenderer;
    NonVisual: typeof FormProviderWrapper;
}

const FormDesignerInterface = FormDesigner as IInternalFormDesignerInterface;
FormDesignerInterface.Visual = FormDesignerRenderer;
FormDesignerInterface.NonVisual = FormProviderWrapper;

export {
    FormDesigner,
    type IFormDesignerProps,
};