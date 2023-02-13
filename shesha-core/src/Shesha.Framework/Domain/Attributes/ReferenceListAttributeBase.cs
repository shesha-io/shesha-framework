using Shesha.Extensions;
using System;
using System.Reflection;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Base class of reference list attributes
    /// </summary>
    public abstract class ReferenceListAttributeBase: Attribute
    {
        #region Properties
        
        [Obsolete("Is used for backward compatibility only")]
        protected string Namespace { get; set; }

        protected string ReferenceListName { get; set; }

        private string _module;
        public string Module {
            get {
                throw new MemberAccessException($"Use `{nameof(GetReferenceListIdentifier)}` to read correct module name");
            }
            set {
                _module = value;
            }
        }

        #endregion

        [Obsolete("Use constructor that accepts single parameter instead")]
        public ReferenceListAttributeBase(string @namespace, string name)
        {
            Namespace = @namespace;
            ReferenceListName = name;
            IsLegacy = !string.IsNullOrWhiteSpace(@namespace);
        }

        public ReferenceListAttributeBase(string name) : this(null, name)
        {
        }

        /// <summary>
        /// Returns <see cref="ReferenceListIdentifier"/> with current name and namespace
        /// </summary>
        public ReferenceListIdentifier GetReferenceListIdentifier(MemberInfo memberInfo)
        {
            return new ReferenceListIdentifier()
            {
                Module = GetModuleName(memberInfo?.DeclaringType?.Assembly),
                Name = FullName
            };
        }

        /// <summary>
        /// Returns <see cref="ReferenceListIdentifier"/> with current name and namespace
        /// </summary>
        public ReferenceListIdentifier GetReferenceListIdentifier(Type enumType)
        {
            return new ReferenceListIdentifier()
            {
                Module = GetModuleName(enumType?.Assembly),
                Name = FullName
            };
        }

        /// <summary>
        /// If true, indicates that the attribute is used in the legacy code with name and namespace but without module
        /// </summary>
        public bool IsLegacy { get; private set; }

        [Obsolete("Is used for backward compatibility only")]
        public string GetNamespace() 
        {
            return Namespace;
        }

        /// <summary>
        /// Returns full name of the reference list: Namespace.Name or Name when namespace is not specified.
        /// Note: Is used for backward compatibility only.
        /// </summary>
        /// <returns></returns>
        public string FullName => !string.IsNullOrWhiteSpace(Namespace)
            ? $"{Namespace}.{ReferenceListName}"
            : ReferenceListName;

        protected string GetModuleName(Assembly assembly)
        {
            return IsLegacy || !string.IsNullOrWhiteSpace(_module)
                ? _module 
                : assembly?.GetConfigurableModuleName();
        }
    }
}
