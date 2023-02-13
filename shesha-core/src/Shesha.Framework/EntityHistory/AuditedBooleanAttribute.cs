using System;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AuditedBooleanAttribute : Attribute
    {
        public string EventText { get; set; }
        public string TrueText { get; set; }
        public string FalseText { get; set; }

        public AuditedBooleanAttribute(string trueText, string falseText)
        {
            TrueText = trueText;
            FalseText = falseText;
        }
    }
}