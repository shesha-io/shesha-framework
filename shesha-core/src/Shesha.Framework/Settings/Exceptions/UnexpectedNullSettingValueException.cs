using System;

namespace Shesha.Settings.Exceptions
{
    /// <summary>
    /// Indicated that setting value is null unexpectedly
    /// </summary>
    public class UnexpectedNullSettingValueException: Exception
    {
        public string SettingModule { get; private set; }
        public string SettingName { get; private set; }

        public UnexpectedNullSettingValueException(string module, string name): base($"Setting '{module}.{name}' value is null but requested as not nullable")
        {
            SettingModule = module;
            SettingName = name;
        }
    }
}