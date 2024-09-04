import { IConfigurableFormComponent } from "@/providers";

export interface IKanbanProps extends IConfigurableFormComponent {
    columnStyle?: any;  
    model?: any;
    headerStyle?: any;
    modalFormIdd?: any;
    modalTitle?: any;
    allowNewRecord: any;
    showModalFooter: any;
    customWidth: any;
    widthUnits: any;
    buttons: any;
    footerButtons: any;
    modalWidth: any;
    filters: any;
    valueFormat: any;
    incomeCustomJs: any;
    outcomeCustomJs: any;
    displayEntityKey: any;
    entityType: any;
    placeholder: any;
}