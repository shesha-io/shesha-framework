using Shesha.Domain;
using Shesha.Utilities;

namespace Shesha.Extensions
{
    /// <summary>
    /// Form configuration extensions
    /// </summary>
    public static class FormConfigurationExtensions
    {
        public static void UpdateMarkupMd5(this FormConfiguration formConfiguration) 
        {
            formConfiguration.MarkupMd5 = !string.IsNullOrWhiteSpace(formConfiguration.Markup)
                ? formConfiguration.Markup.ToMd5Fingerprint()
                : null;
        }
    }
}
