using System.Collections.Generic;

namespace Shesha.Configuration
{
    public class MainMenuSettings
    {
        private static MainMenuSettings? defaultInstance;
        public static MainMenuSettings Default
        {
            get
            {
                return defaultInstance = defaultInstance ??
                    new MainMenuSettings()
                    {
                       Version = 2,
                       Items = new List<object>(),
                    };
            }
        }

        public int Version { get; set; }
        public List<object> Items { get; set; } = new();
    }
}
