# Release Notes

## 💪 Enhancements

### New Configuration Properties for Filelist Component

1. **Replace Functionality**
    - Added `Allow Replace` configuration option to enable file replacement capabilities

2. **Version History**
    - Added `Allow View History` configuration option to display file version history to users

3. **Custom Actions**
    - Introduced `Custom Actions` configuration allowing configurators to define custom action buttons for files
    - Custom action buttons appear in the file hover toolbar alongside standard actions

4. **Custom Content Forms**
    - Added `Custom Area Form` configuration to display custom information and components beneath each file
    - Parent form automatically passes current file data to the subform during runtime rendering

### User Interface Improvements

**Enhanced File Hover Toolbar**
    - Implemented floating toolbar that displays when hovering over files
    - Toolbar consolidates all relevant actions including:
      - Standard actions (Download, Delete, Replace, View History)
      - Custom configured actions
    - Removed standalone delete icon in favor of integrated delete button within the toolbar

**Context-Aware Action Display**
- In view mode (non-edit), toolbar intelligently displays only appropriate actions:
  - Download button
  - View History button (when enabled)
  - Custom actions
- Edit mode displays full action set including delete and replace options

---

These enhancements provide greater flexibility in file management workflows and improved user experience through consolidated, context-aware action controls.
