# Release Notes
## Enhancements
- Improved API functionality by cleaning up and removing duplications in dynamically generated APIs.
- Enhanced flexibility in displaying dataTable content with support for sub-form based custom rendering on dataTable columns.
- Implemented restriction preventing assignment of configurations to modules not in development.
- Tooltip descriptions are now exposed, providing additional information when hovering over icons on action columns.
- Updated existing edit mode and introduced new edit mode with icons
- Implemented cosmetic changes to enhance the entity configuration interface.

## Bug Fixes
- Fixed issue where an incorrect module was appended to the reference list endpoint.
- Resolved issue where size and style properties were not being applied to the component entity picker.
- Fixed bug causing duplication of properties on the password combo component.
- Addressed reference list navigation error after drag-and-drop, resulting in missing radio buttons.
- Capitalized 'refListName' displayed when hovering over referenceListStatus.
- Fixed file list component still prompting for additional attachments even after multiple files have been attached when required is true.
- Fixed inability to delete a file that failed to upload due to file size.
- Fixed issue where switch values do not display when rendering in details view.

## UX Changes
- Removed bottom scroller displayed at the bottom when on the designer form.
- Increased size of Quick Edit dialog width and height for improved visibility.
