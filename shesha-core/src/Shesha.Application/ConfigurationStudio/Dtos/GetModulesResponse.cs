using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Resposne of the <see cref="ConfigurationStudioAppService.GetModulesAsync"/> operation
    /// </summary>
    public class GetModulesResponse
    {
        public List<ModuleInfo> Modules { get; set; } = new List<ModuleInfo>();

        public class ModuleInfo 
        {
            /// <summary>
            /// Module name
            /// </summary>
            public string Name { get; set; }
            /// <summary>
            /// Description
            /// </summary>
            public string Description { get; set; }
            /// <summary>
            /// Alias, is used as an identifier on the front-end. By default camelCased <see cref="Name"/> is used as an identifier
            /// </summary>
            public string Alias { get; set; }
            /// <summary>
            /// Is editable
            /// </summary>
            public bool IsEditable { get; set; }
        }
    }
}
