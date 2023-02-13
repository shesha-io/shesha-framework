using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace Shesha.Localization
{
    public static class SheshaLocalizationConfigurer
    {
        public static void Configure(ILocalizationConfiguration localizationConfiguration)
        {
            localizationConfiguration.HumanizeTextIfNotFound = true;
            localizationConfiguration.WrapGivenTextIfNotFound = false;
            localizationConfiguration.Sources.Add(
                new DictionaryBasedLocalizationSource(SheshaConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        typeof(SheshaLocalizationConfigurer).GetAssembly(),
                        "Shesha.Localization.SourceFiles"
                    )
                )
            );
        }
    }
}
