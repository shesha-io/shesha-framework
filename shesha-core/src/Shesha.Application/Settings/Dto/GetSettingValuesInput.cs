using Shesha.Domain;
using System.Collections.Generic;

namespace Shesha.Settings.Dto
{
    /// <summary>
    /// Get setting values input
    /// </summary>
    public class GetSettingValuesInput
    {
        public SettingIdentifier[] Identifiers { get; set; }
    }
}