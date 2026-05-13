namespace Shesha.Elmah
{
    public class SheshaElmahSettings
    {
        public const string SectionName = "SheshaElmah";
        public const string PathKey = "Path";
        public const string IsLoggingDisabledKey = "IsLoggingDisabled";
        public const string IsFetchingDisabledKey = "IsFetchingDisabled";        

        public string Path { get; init; }
        
        public static bool IsLoggingDisabled { get; set; }
        public static bool IsFetchingDisabled { get; set; }        
    }
}
