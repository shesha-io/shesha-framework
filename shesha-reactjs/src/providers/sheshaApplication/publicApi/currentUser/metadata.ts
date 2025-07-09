import { TypeDefinition, TypeDefinitionLoader } from '@/interfaces/metadata';
import { IObjectMetadataBuilder } from '@/utils/metadata/metadataBuilder';
import { userApiSourceCode } from '@/publicJsApis';

const getUserApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
  return Promise.resolve({
    typeName: 'UserApi',
    files: [
      {
        content: userApiSourceCode,
        fileName: 'apis/userApi.d.ts',
      },
    ],
  });
};

export const getUserApiProperties = (builder: IObjectMetadataBuilder): IObjectMetadataBuilder =>
  builder
    .addBoolean('isLoggedIn', 'Is logged in')
    .addString('id', 'Id')
    .addString('userName', 'User Name')
    .addString('firstName', 'First Name')
    .addString('lastName', 'Last Name')
    .addString('personId', 'Person Id')
    .setTypeDefinition(getUserApiTypeDefinition);
