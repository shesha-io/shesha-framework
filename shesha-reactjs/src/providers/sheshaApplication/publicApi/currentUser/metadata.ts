import { TypeDefinition, TypeDefinitionLoader } from "@/interfaces/metadata";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";

const getUserApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
    var userSource = [
        "export interface IEntityReferenceDto {",
        "  _className?: string;",
        "  id?: string;",
        "}",
        "",
        "/**",
        " * Current logged in User API",
        " */",
        "export interface UserApi {",
        "    /**",
        "     * Is user logged in",
        "     */",
        "    isLoggedIn: boolean;",
        "    /**",
        "     * Internal Id",
        "     */",
        "    id: string;",
        "    /**",
        "     * User Name",
        "     */",
        "    userName: string;",
        "    /**",
        "     * First Name",
        "     */",
        "    firstName: string;",
        "    /**",
        "     * Last Name",
        "     */",
        "    lastName: string;",
        "    /**",
        "     * Has role",
        "     */",
        "    hasRoleAsync: (role: string) => Promise<boolean>;",
        "    /**",
        "     * Has permission",
        "     */",
        "    hasPermissionAsync: (permission: string, permissionedEntity?: IEntityReferenceDto) => Promise<boolean>;",
        "    /**",
        "     * Get User Setting",
        "     */",
        "    getUserSettingValueAsync(name: string, module: string, defaultValue?: any, dataType?: string): Promise<any>",
        "    /**",
        "     * Update User Setting",
        "     */",
        "    updateUserSettingValueAsync(name: string, module: string, value: any, dataType?: string): Promise<void>",
        "}",
    ].join("\n");
    return Promise.resolve({
        typeName: "UserApi",
        files: [{
            content: userSource,
            fileName: "apis/userApi.d.ts",
        }],        
    });
};

export const getUserApiProperties = (builder: MetadataBuilder): MetadataBuilder =>
    builder
        .addBoolean("isLoggedIn", "Is logged in")
        .addString("id", "Id")
        .addString("userName", "User Name")
        .addString("firstName", "First Name")
        .addString("lastName", "Last Name")
        .setTypeDefinition(getUserApiTypeDefinition);