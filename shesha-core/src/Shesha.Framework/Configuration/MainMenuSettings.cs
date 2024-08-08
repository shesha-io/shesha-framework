using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration
{
    public class MainMenuSettings
    {
        private static MainMenuSettings defaultInstance;
        public static MainMenuSettings Default
        {
            get
            {
                return defaultInstance = defaultInstance ??
                    new MainMenuSettings()
                    {
                       Version = 2,
                       Items = new List<MainMenuItem>(),
                    };
            }
        }

        public int Version { get; set; }
        public List<MainMenuItem> Items { get; set; }
    }

    public class MainMenuItem
    {
        public string Id { get; set; }
        public object ActionConfiguration { get; set; }
        public string Title { get; set; }
        public string Tooltip { get; set; }
        public string ItemType { get; set; }

        public string Icon { get; set; }
        public bool Hidden { get; set; }
        public string Visibility { get; set; }
        public List<string> RequiredPermission { get; set; }
    }
}
