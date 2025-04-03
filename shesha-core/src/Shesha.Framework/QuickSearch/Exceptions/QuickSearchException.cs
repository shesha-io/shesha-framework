using System;

namespace Shesha.QuickSearch.Exceptions
{
    /// <summary>
    /// Indicates problems during JsonLogic parsing
    /// </summary>
    public class QuickSearchException : Exception
    {
        /// <summary>
        /// Expression whose parsing has failed
        /// </summary>
        public string QuickSearch { get; private set; }

        public QuickSearchException(string quickSearch) : base($"Failed to build linq expression for quick search expression '{quickSearch}'")
        {
            QuickSearch = quickSearch;
        }
    }
}
