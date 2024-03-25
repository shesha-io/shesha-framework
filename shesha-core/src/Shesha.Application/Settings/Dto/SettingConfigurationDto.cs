using Shesha.Metadata;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Setting configuration DTO
    /// </summary>
    public class SettingConfigurationDto: SettingApiItemBase
    {
        public DataTypeInfo DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        public string DataFormat { get; set; }

        public SettingApiItemBase Module { get; set; }
        public SettingApiItemBase Category { get; set; }

        public SettingConfigurationDto(SettingDefinition definition)
        {
            Name = definition.Name;
            Description = definition.Description;
            Accessor = definition.Accessor;
            DataType = definition.GetSettingDataType();

            Category = new SettingApiItemBase 
            { 
                Name = definition.Category,
                Accessor = definition.CategoryAccessor,
            };

            Module = new SettingApiItemBase
            {
                Name = definition.ModuleName,
                Description = definition.Description,
                Accessor = definition.ModuleAccessor
            };            
        }
    }

    public class SettingApiItemBase
    { 
        public string Name { get; set; }
        public string Description { get; set; }
        public string Accessor { get; set; }
    }
}