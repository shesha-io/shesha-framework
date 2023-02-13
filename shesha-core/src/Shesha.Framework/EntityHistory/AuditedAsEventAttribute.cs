using System;
using Castle.Core.Internal;
using Castle.DynamicProxy.Generators.Emitters.SimpleAST;
using NHibernate.Cfg.XmlHbmBinding;
using Shesha.Domain;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AuditedAsEventAttribute : Attribute
    {
        public Type EventCreator  { get; set; }
        public bool SaveFullInfo { get; set; }

        public AuditedAsEventAttribute(Type eventCreator, bool saveFullInfo = true)
        {
            EventCreator = eventCreator;
            SaveFullInfo = saveFullInfo;
        }
    }
}