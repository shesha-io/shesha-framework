using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class CustomCategoriesAttribute : Attribute
    {
        public string ScanCategoriesPath { get; set; }
    }
}
