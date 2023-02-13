using System;
using Abp.Application.Services.Dto;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Update component settings input
    /// </summary>
    public class ConfigurableComponentUpdateSettingsInput
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Component name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// If true, indicates that component is application specific
        /// </summary>
        public bool IsApplicationSpecific { get; set; }

        /// <summary>
        /// Settings in JSON format
        /// </summary>
        public string Settings { get; set; }
    }
}
