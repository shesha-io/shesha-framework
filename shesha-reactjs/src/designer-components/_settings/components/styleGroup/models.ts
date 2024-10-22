import { IConfigurableFormComponent } from "@/interfaces";
import { omittedStyleType } from "./styleGroup";
import { IBorderValue } from "@/designer-components/styleBorder/interfaces";
import { IBackgroundValue } from "@/designer-components/styleBackground/interfaces";
import { IFontValue } from "@/designer-components/styleFont/interfaces";
import { IShadowValue } from "@/designer-components/styleShadow/interfaces";
import { IDimensionsValue } from "@/designer-components/styleDimensions/interfaces";

export interface IStyleGroupProps extends IConfigurableFormComponent {
    omitted?: omittedStyleType[];
}

export interface IStyleType {
    border?: IBorderValue;
    background?: IBackgroundValue;
    font?: IFontValue;
    shadow?: IShadowValue;
    dimensions?: IDimensionsValue;
}