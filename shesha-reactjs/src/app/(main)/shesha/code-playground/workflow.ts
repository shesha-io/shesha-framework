export enum Environment {
    None,
    FrontEnd,
    BackEnd,
}

type PersonExtensions = {
    getFullName: () => string;
};

export type Person<Env extends Environment = Environment.None> = {
    firstName: string;
    lastName: string;
} & (Env extends Environment.BackEnd
    ? PersonExtensions
    : {});

type WorkflowExtensions = {
    getInitiatorFullName: () => string;
};

export type WorkflowInstance<Env extends Environment = Environment.None> = {
    refNo: string;
    initiator?: Person<Env>;
} & (Env extends Environment.BackEnd
    ? WorkflowExtensions
    : {});

export const frontEndPerson: Person = {
    firstName: 'John',
    lastName: 'Doe',
};
//frontEndPerson.getFullName();

const backEndPerson: Person<Environment.BackEnd> = {
    firstName: 'John',
    lastName: 'Doe',
    getFullName: () => `${backEndPerson.firstName} ${backEndPerson.lastName}`,
};

export const wf: WorkflowInstance<Environment.BackEnd> = {
    refNo: '123',
    //initiator: frontEndPerson,
    initiator: backEndPerson,
    getInitiatorFullName: () => backEndPerson.getFullName(),
};

type CustomWorkflowInstanceExtensions = {
    getCustomThing: () => string;
};

export type CustomWorkflowInstance<Env extends Environment = Environment.None> = WorkflowInstance<Env> & {
    customPerson?: Person<Env>;
} & (Env extends Environment.BackEnd
    ? CustomWorkflowInstanceExtensions
    : {});

export const customWfBackend: CustomWorkflowInstance<Environment.BackEnd> = {
    refNo: '123',
    getInitiatorFullName: () => backEndPerson.getFullName(),
    getCustomThing: () => 'custom thing',
};    

export const customWfFrontend: CustomWorkflowInstance = {
    refNo: '123',
};    

export type CustomWorkflowInstanceBackend = {
    GetRefNo: () => void;
    GetWorkflowName: () => void;
};