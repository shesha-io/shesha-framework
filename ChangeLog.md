# Release Notes

## 🐞 Bug Fixes

- **Wrapped Form Labels Overflow Fix** - Fixed long form labels that wrap onto multiple lines overflowing into the next row and overlapping subsequent form items
- **Text Component Visible Condition Fix** - Fixed the Text component ignoring its Visible setting when turned off
- **Searchable Reference-List Dropdown Fix** - Searchable reference-list dropdowns now match the search text against the item label instead of the item value
- **Query Builder Filtration Fix** - Fixed 400 Bad Request errors when a permanent filter uses two dynamic Evaluate (mustache) conditions with Required = true and Required = false. Null expressions are no longer sent to the server; the table now returns and displays rows correctly
- **JS-Configured Interaction Mode & Visibility Fix**
  - Fixed editMode values (edit, Editable, true) rendering fields as disabled instead of editable on form components
  - Fixed buttons returning readOnly / false incorrectly remaining clickable
  - Custom dialog footer button scripts are now evaluated — the Save button correctly respects its condition, and hidden buttons are no longer shown
- **Subform Wrap/Col & Label/Col Migration Fix** - Added migration for subform wrapCol and labelCol properties
- **onAfterDataLoad Hook Data Fix**
  - Fixed the onAfterDataLoad hook receiving only the initial values ({id}) as its data argument
  - The hook now receives the full entity record, matching form.data
- **Subform expressions fix** - Fixed Subform expressions cannot see the host record (data, pageContext, query, parentFormValues)
- **Query Builder Style Fix** - Fixed broken styles in the Query Builder that prevented users from selecting required values
- **GetAuditTrail RuntimeBinderException Fix** - Fixed GetAuditTrail throwing a RuntimeBinderException for any entity with a tracked many-to-many audit relation (e.g., an Employee with a ShaRoleAppointedPerson role appointment)
