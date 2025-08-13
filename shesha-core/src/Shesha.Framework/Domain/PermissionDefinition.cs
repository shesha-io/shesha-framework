using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class PermissionDefinitionBase : ConfigurationItem<PermissionDefinitionRevision> 
    { 
    }
    

    [Entity(
        FriendlyName = "Permission",
        TypeShortAlias = "Shesha.Framework.PermissionDefinition", 
        GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService
    )]
    //[JoinedProperty("permission_definitions", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class PermissionDefinition : PermissionDefinitionBase
    {
        public const string ItemTypeName = "permission-definition";
    }
}