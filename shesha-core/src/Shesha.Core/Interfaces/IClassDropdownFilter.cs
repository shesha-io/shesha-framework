using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Shesha.Interfaces
{
    /// <summary>
    /// Filters classes for the dropdown element
    /// </summary>
    public interface IClassDropdownFilter
    {
        /// <summary>
        /// Returns filtered classes
        /// </summary>
        /// <param name="types"></param>
        /// <param name="modelMetadata"></param>
        /// <returns></returns>
        List<Type> GetFiltered(List<Type> types, ModelMetadata modelMetadata);
    }
}
