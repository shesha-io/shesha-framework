using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceListItem update syntax
    /// </summary>
    public interface IUpdateReferenceListItemSyntax
    {
        /// <summary>
        /// Set item text
        /// </summary>
        IUpdateReferenceListItemSyntax SetItemText(string itemText);

        /// <summary>
        /// Set item description
        /// </summary>
        IUpdateReferenceListItemSyntax SetDescription(string description);

        /// <summary>
        /// Set item description
        /// </summary>
        IUpdateReferenceListItemSyntax SetOrderIndex(Int64 orderIndex);
    }
}
