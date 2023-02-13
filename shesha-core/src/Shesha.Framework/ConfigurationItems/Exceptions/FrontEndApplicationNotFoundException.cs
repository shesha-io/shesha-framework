using Shesha.Domain;
using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    public class FrontEndApplicationNotFoundException: Exception
    {
        public string AppKey { get; set; }
        public FrontEndApplicationNotFoundException(string appKey): base($"Front-end application with {nameof(FrontEndApp.AppKey)} = '{appKey}' not found")
        {
            AppKey = appKey;
        }
    }
}
