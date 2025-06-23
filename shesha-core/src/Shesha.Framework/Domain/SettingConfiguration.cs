using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class SettingConfigurationBase : ConfigurationItem<SettingConfigurationRevision> 
    { 
    }

    /// <summary>
    /// Settings Configuration
    /// </summary>
    [SnakeCaseNaming]
    [DiscriminatorValue(ItemTypeName)]
    [Entity(FriendlyName = "Setting")]
    public class SettingConfiguration: SettingConfigurationBase
    {
        public const string ItemTypeName = "setting-configuration";

        public override string ItemType => ItemTypeName;
    }
}
