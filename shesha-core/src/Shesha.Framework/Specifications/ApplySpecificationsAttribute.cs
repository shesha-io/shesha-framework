using Abp.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Specifications
{
    /// <summary>
    /// This attribute is used to apply specifications automatically to any call of IRepository.GetAll()
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class ApplySpecificationsAttribute: Attribute
    {
        /// <summary>
        /// Types of specifications to apply.
        /// </summary>
        public Type[] SpecificationTypes { get; private set; }

        /// <summary>
        /// Used to apply specifications to any call of IRepository.GetAll()
        /// </summary>
        /// <param name="specificationTypes">Types of specifications (<see cref="ISpecification{T}"/>)</param>
        public ApplySpecificationsAttribute(params Type[] specificationTypes)
        {
            SpecificationTypes = specificationTypes;
        }
    }
}
