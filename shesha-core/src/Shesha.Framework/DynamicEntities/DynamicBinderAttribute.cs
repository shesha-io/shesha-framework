using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic mapping settings
    /// </summary>
    [AttributeUsage(AttributeTargets.Parameter, AllowMultiple = false)]
    public class DynamicBinderAttribute: Attribute, IDynamicMappingSettings
    {
        /// <summary>
        /// If true, indicates that entity references should be mapped as DTOs (id and display name) instead of raw values (id)
        /// </summary>
        public bool UseDtoForEntityReferences { get; set; } = false;
        
        /// <summary>
        /// If true, indicates that need to create DynamicDtoProxy
        /// </summary>
        public bool UseDynamicDtoProxy { get; set; } = false;
    }
}