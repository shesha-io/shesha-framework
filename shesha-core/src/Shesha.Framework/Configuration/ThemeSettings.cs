using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration
{
    public class ThemeSettings
    {
        private static ThemeSettings defaultInstance;
        public static ThemeSettings Default
        {
            get
            {
                return defaultInstance = defaultInstance ??
                    new ThemeSettings()
                    {
                        Application = new ApplicationSettings()
                        {
                            PrimaryColor = "#2197dc",
                            ErrorColor = "#ff4d4f",
                            WarningColor = "#ff6f00",
                            InfoColor = "#faad14",
                            SuccessColor = "#25b864",
                        },
                        Text = new TextSettings()
                        {
                            Default = "#000000",
                            Secondary = "#8c8c8c",
                        },
                        Sidebar = "dark",
                        LayoutBackground = "#fafafa",
                        SidebarBackground = "#4d192b",
                        LabelSpan = 6,
                        ComponentSpan = 18
                    };
            }
        }
        public class ApplicationSettings
        {
            public string PrimaryColor { get; set; }
            public string ErrorColor { get; set; }
            public string WarningColor { get; set; }
            public string SuccessColor { get; set; }
            public string InfoColor { get; set; }
        }

        public class TextSettings
        {
            public string Default { get; set; }
            public string Secondary { get; set; }
        }

        public ThemeSettings.ApplicationSettings Application { get; set; }
        public string Sidebar { get; set; }
        public string LayoutBackground { get; set; }
        public ThemeSettings.TextSettings Text { get; set; }
        public string SidebarBackground { get; set; }
        public int? LabelSpan { get; set; }
        public int? ComponentSpan { get; set; }
    }
}
