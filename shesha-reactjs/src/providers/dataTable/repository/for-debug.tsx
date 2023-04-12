import React from "react";
import { FC } from "react";
import { IHasRepository } from "./interfaces";

export interface ITableProps {
    name: string;
}
export const Table: FC<ITableProps> = ({ name }) => {
    return <>{name}</>;
};

export interface ITableWithRepositoryProps extends ITableProps, IHasRepository {

}
export const TableWithRepository: FC<ITableWithRepositoryProps> = ({ name, repository }) => {
    console.log({ name, repository });
    return <>TableWithRepository</>;
};