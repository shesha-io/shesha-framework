using System;

namespace Shesha.GraphQL.Dtos
{
    /// <summary>
    /// GraphQL specific version of FilteredPagedAndSortedResultRequestDto
    /// </summary>
    public class TreeRequestDto
    {
        /// <summary>
        /// Filter string in JsonLogic format
        /// </summary>
        public string Filter { get; set; }

        /// <summary>
        /// Parent column
        /// </summary>
        public string ParentProperty { get; set; }

        /// <summary>
        /// Parent Id
        /// </summary>
        public Guid? ParentId { get; set; }        
    }
}
