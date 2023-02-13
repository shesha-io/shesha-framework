using Abp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Context of the dynamic DTO building process, is used by the <see cref="IDynamicDtoTypeBuilder"/>
    /// </summary>
    public class DynamicDtoTypeBuildingContext : IHasNamePrefixStack
    {
        /// <summary>
        /// Model type. Typically it's a type of entity
        /// </summary>
        public Type ModelType { get; set; }

        /// <summary>
        /// Property filter. Return true if the field should be included into the result type
        /// </summary>
        public Func<string, bool> PropertyFilter { get; set; }

        /// <summary>
        /// Classes dictionary, is used for analyze of the building process and for constructions of the automapper configurations
        /// </summary>
        public Dictionary<string, Type> Classes = new Dictionary<string, Type>();

        /// <summary>
        /// Register .net type that created during the building process. This method updates classes dictionary <see cref="Classes"/>
        /// </summary>
        /// <param name="class"></param>
        public void ClassCreated(Type @class) 
        {
            Classes.Add(CurrentPrefix, @class);
        }

        /// <summary>
        /// If true, indicates that a service property '_formFields' should be added to the result type
        /// </summary>
        public bool AddFormFieldsProperty { get; set; }

        /// <summary>
        /// If true, indicates that entity references should be mapped as DTOs (id and display name) instead of raw values (id)
        /// </summary>
        public bool UseDtoForEntityReferences { get; set; }

        #region IHasNamePrefixStack implementation

        private Stack<string> _namePrefixStack = new Stack<string>();

        /// <summary>
        /// Open name prefix context and returns disposable action that automaticaly closes it. Is used in the recursive operations
        /// </summary>
        /// <param name="prefix">New prefix value</param>
        /// <returns></returns>
        public IDisposable OpenNamePrefix(string prefix)
        {
            _namePrefixStack.Push(prefix);
            
            var currentPrefix = CurrentPrefix;

            return new DisposeAction(() => CloseNamePrefix(currentPrefix));
        }

        /// <summary>
        /// Close name prefix and with nesting
        /// </summary>
        private void CloseNamePrefix(string fullPrefix)
        {
            if (CurrentPrefix != fullPrefix)
                throw new Exception($"Name prefix closed in a wrong order. Expected prefix value: '{CurrentPrefix}', actual: '{fullPrefix}'. Make sure that you use dispose results of the {nameof(OpenNamePrefix)} method");
            

            var closedPrefix = _namePrefixStack.Pop();
        }
        
        /// <summary>
        /// Current prefix in dot notation (e.g. 'prefix1.prefix2')
        /// </summary>
        public string CurrentPrefix {
            get {
                var value = _namePrefixStack.Any()
                    ? _namePrefixStack.Aggregate((next, current) => current + "." + next)
                    : string.Empty;
                return value;
            }
        }

        #endregion
    }
}