namespace Shesha.Configuration
{
    public class ThemeSettings
    {
        private static ThemeSettings? defaultInstance;
        public static ThemeSettings Default
        {
            get
            {
                return defaultInstance ??= new ThemeSettings()
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
                    ComponentBackground = "#ffffff",
                    LabelSpan = 6,
                    ComponentSpan = 18,
                    MarginPadding = new MarginPaddingSettings()
                    {
                        FormFields = "",
                        Layout = "",
                        Grid = "",
                        Standard = "",
                        Inline = "",
                    },
                    LayoutComponents = new LayoutComponentsSettings()
                    {
                        StylingBox = "{\"marginBottom\":\"0\"}",
                        GridGapHorizontal = 8,
                        GridGapVertical = 8,
                        Border = new BorderTheme()
                        {
                            Border = new BorderConfig()
                            {
                                All = new BorderStyle()
                                {
                                    Width = "1",
                                    Style = "solid",
                                    Color = "#d9d9d9"
                                }
                            },
                            Radius = new RadiusConfig()
                            {
                                All = 4
                            },
                            RadiusType = "all"
                        },
                        Shadow = new ShadowTheme()
                        {
                            OffsetX = 0,
                            OffsetY = 0,
                            BlurRadius = 0,
                            SpreadRadius = 0,
                            Color = "#000000"
                        }
                    },
                    InputComponents = new InputComponentsSettings()
                    {
                        LabelSpan = 8,
                        ContentSpan = 16,
                        LabelColon = true,
                        StylingBox = "{\"marginBottom\":\"0\"}"
                    },
                    StandardComponents = new StandardComponentsSettings()
                    {
                        StylingBox = "{\"marginBottom\":\"0\"}"
                    },
                    InlineComponents = new InlineComponentsSettings()
                    {
                        StylingBox = "{\"marginBottom\":\"0\"}"
                    }
                };
            }
        }
        public class ApplicationSettings
        {
            public string? PrimaryColor { get; set; }
            public string? ErrorColor { get; set; }
            public string? WarningColor { get; set; }
            public string? SuccessColor { get; set; }
            public string? InfoColor { get; set; }
        }

        public class TextSettings
        {
            public string? Default { get; set; }
            public string? Secondary { get; set; }
        }

        public class MarginPaddingSettings
        {
            public string? FormFields { get; set; }
            public string? Layout { get; set; }
            public string? Grid { get; set; }
            public string? Standard { get; set; }
            public string? Inline { get; set; }
        }

        public class BorderStyle
        {
            public string? Width { get; set; }
            public string? Style { get; set; }
            public string? Color { get; set; }
        }

        public class RadiusConfig
        {
            public int? All { get; set; }
            public int? TopLeft { get; set; }
            public int? TopRight { get; set; }
            public int? BottomLeft { get; set; }
            public int? BottomRight { get; set; }
        }

        public class BorderTheme
        {
            public BorderConfig? Border { get; set; }
            public RadiusConfig? Radius { get; set; }
            public string? RadiusType { get; set; }
        }

        public class BorderConfig
        {
            public BorderStyle? All { get; set; }
        }

        public class ShadowTheme
        {
            public int? OffsetX { get; set; }
            public int? OffsetY { get; set; }
            public int? BlurRadius { get; set; }
            public int? SpreadRadius { get; set; }
            public string? Color { get; set; }
        }

        public class LayoutComponentsSettings
        {
            public string? StylingBox { get; set; }
            public int? GridGapHorizontal { get; set; }
            public int? GridGapVertical { get; set; }
            public BorderTheme? Border { get; set; }
            public ShadowTheme? Shadow { get; set; }
        }

        public class InputComponentsSettings
        {
            public int? LabelSpan { get; set; }
            public int? ContentSpan { get; set; }
            public bool? LabelColon { get; set; }
            public string? StylingBox { get; set; }
        }

        public class StandardComponentsSettings
        {
            public string? StylingBox { get; set; }
        }

        public class InlineComponentsSettings
        {
            public string? StylingBox { get; set; }
        }

        public ApplicationSettings? Application { get; set; }
        public string? Sidebar { get; set; }
        public string? LayoutBackground { get; set; }
        public TextSettings? Text { get; set; }
        public string? SidebarBackground { get; set; }
        public int? LabelSpan { get; set; }
        public int? ComponentSpan { get; set; }
        public MarginPaddingSettings? MarginPadding { get; set; }
        public string? ComponentBackground { get; set; }
        public LayoutComponentsSettings? LayoutComponents { get; set; }
        public InputComponentsSettings? InputComponents { get; set; }
        public StandardComponentsSettings? StandardComponents { get; set; }
        public InlineComponentsSettings? InlineComponents { get; set; }
    }
}
