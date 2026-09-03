import { Migrator } from '@/utils/fluentMigrator/migrator';
import { IConfigurableFormComponent, SettingsMigrationContext } from '@/interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import AttachmentsEditor from '../attachmentsEditor';
import { IAttachmentsEditorProps } from '../interfaces';

/**
 * A setting is drawn as Overridden when the component model holds a value for it and the default
 * model supplies one too — see `DefaultModelInstance.getValueInfo`. A component straight out of the
 * toolbox has overridden nothing, so its model must carry no device styles at all and inherit the
 * whole Appearance tab from `getDefaultStyles()`.
 *
 * Migrations that bake defaults into `desktop`/`tablet`/`mobile` therefore have to skip a new
 * component. Style Downloaded Files and Downloaded Icon were written unconditionally and came up as
 * Overridden the moment a File List was dropped on a form.
 */
describe('a newly dropped File List', () => {
  const newComponentModel = (): IAttachmentsEditorProps => {
    const migrator = new Migrator<IConfigurableFormComponent, IAttachmentsEditorProps, SettingsMigrationContext>();

    /* Declared optional on the toolbox component, so it is checked rather than asserted — a File
       List that had lost its migrator would otherwise fail these as an unrelated crash. */
    const fluent = AttachmentsEditor.migrator?.(migrator);
    if (!isDefined(fluent)) throw new Error('The File List component defines no migrator.');

    const context: SettingsMigrationContext = {
      isNew: true,
      formSettings: undefined,
      /* Spelled out rather than taken from `getEmptyFlatMarkup`, whose module is not initialised by
         the time this file's imports resolve. None of these migrations read the structure anyway. */
      flatStructure: { allComponents: {}, componentRelations: {}, parents: {} } satisfies IFlatComponentsStructure,
      componentId: 'attachments-editor',
    };

    /* Typed rather than passed as a literal: `upgrade` takes an IHasVersion, which the rest of a
       component model is excess to. */
    const dropped: IConfigurableFormComponent = {
      id: 'attachments-editor',
      type: AttachmentsEditor.type,
      propertyName: 'documents',
      version: -1,
    };

    return fluent.migrator.upgrade(dropped, context);
  };

  it.each(['desktop', 'tablet', 'mobile'] as const)('carries no %s style model', (device) => {
    expect(newComponentModel()[device]).toBeUndefined();
  });

  /* Named separately from the blanket check above: these two are the settings the bug was reported
     against, and a later migration writing either one back would go unnoticed otherwise. */
  it.each(['styleDownloadedFiles', 'downloadedIcon'] as const)('leaves %s to the defaults', (setting) => {
    const model = newComponentModel();
    expect(model[setting]).toBeUndefined();
    expect(model.desktop?.[setting]).toBeUndefined();
  });

  /* The defaults the model is now free to inherit — no longer reachable through the model itself,
     so the toolbox definition has to keep supplying them. */
  it('still gets the downloaded-file defaults from the component definition', () => {
    const defaults = AttachmentsEditor.getDefaultStyles?.() as IAttachmentsEditorProps | undefined;

    expect(defaults?.styleDownloadedFiles).toBe(false);
    expect(defaults?.downloadedIcon).toBe('CheckCircleOutlined');
  });
});
