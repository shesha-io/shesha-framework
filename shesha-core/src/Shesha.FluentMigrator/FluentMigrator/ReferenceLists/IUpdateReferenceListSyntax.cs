using System;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public interface IUpdateReferenceListSyntax
    {
        /// <summary>
        /// Set description
        /// </summary>
        /// <param name="description"></param>
        /// <returns></returns>
        IUpdateReferenceListSyntax SetDescription(string description);

        
        /// <summary>
        /// Set NoSelectionValue (default value is -999)
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        IUpdateReferenceListSyntax SetNoSelectionValue(Int64? value);

        /// <summary>
        /// Add Item
        /// </summary>
        /// <param name="value"></param>
        /// <param name="item"></param>
        /// <param name="orderIndex"></param>
        /// <param name="description"></param>
        /// <returns></returns>
        IUpdateReferenceListSyntax AddItem(long value, string item, Int64? orderIndex = null, string description = null);

        /// <summary>
        /// Update item
        /// </summary>
        IUpdateReferenceListSyntax UpdateItem(long itemValue, Action<IUpdateReferenceListItemSyntax> updateAction);

        /// <summary>
        /// Delete item
        /// </summary>
        /// <param name="itemValue">Item value</param>
        /// <returns></returns>
        IUpdateReferenceListSyntax DeleteItem(Int64 itemValue);

        /// <summary>
        /// Delete all items
        /// </summary>
        /// <returns></returns>
        IUpdateReferenceListSyntax DeleteAllItems();
    }
}
