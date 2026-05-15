# Release Notes

## 🐞 Bug Fixes

- **User Details Form:** Resolved an error that occurred when trying to delete an assigned role.
- **Generic Entity Reference:** Fixed an exception related to `GenericEntityReference` lacking a default constructor.

## 💪 Enhancements

- **SyncClientApi:** Added a server-snapshot shortcut to skip per-entity comparison on no-change hot paths, reducing unnecessary processing.
- **EntityModelProviderCache:** Fixed cache invalidation to trigger only on `EntityConfig` changes instead of any `ConfigurationItem` change.
- **SyncClientApi Metadata:** Prevented re-fetching metadata for new modules by using cached `EntityModelDto.Metadata` where applicable.
