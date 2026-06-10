/**
 * Shared extraction of the "Appearance" settings markup for a component type.
 *
 * The Component Defaults panel renders only the "Appearance" tab of each component's settings form.
 * This module locates that tab in the component's settings markup and returns ready-to-render markup
 * (plus the extra appearance properties surfaced from other tabs — see ./appearanceAdapter).
 *
 * It is used both by the panel (to render the appearance form) and by the component menu
 * (./toolboxComponents) to decide which components are actually styleable and should be listed.
 */

import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import {
  IConfigurableFormComponent,
  isConfigurableFormComponent,
  isRawComponentsContainer,
} from '@/providers/form/models';
import { ITabPaneProps } from '@/designer-components/propertiesTabs/models';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { getExtraAppearanceComponents } from './appearanceAdapter';

/** Markup node that wraps designer settings tabs (e.g. Appearance). */
interface SearchableTabsMarkup extends IConfigurableFormComponent {
  type: 'propertiesTabs' | 'searchableTabs';
  tabs: ITabPaneProps[];
}

function isSearchableTabsMarkup(c: unknown): c is SearchableTabsMarkup {
  if (!isConfigurableFormComponent(c)) return false;
  if (c.type !== 'propertiesTabs' && c.type !== 'searchableTabs') return false;
  return Array.isArray((c as { tabs?: unknown }).tabs);
}

export interface IAppearanceMarkup {
  components: IConfigurableFormComponent[];
  formSettings?: unknown;
}

/**
 * Extracts the Appearance-tab markup for the given component type, or `null` when the component has
 * no settings form, no Appearance tab, or its markup cannot be resolved.
 */
export const getAppearanceMarkup = (componentType: string | undefined): IAppearanceMarkup | null => {
  if (!componentType) return null;

  const componentDef = getComponentDefinitions().get(componentType);
  if (!componentDef?.settingsFormMarkup) return null;

  // Get the settings form markup (could be a function or object)
  let settingsFormMarkup = componentDef.settingsFormMarkup;

  // If it's a function (SettingsFormMarkupFactory), execute it to get the markup
  if (typeof settingsFormMarkup === 'function') {
    const formBuilderFactory = makeFormBuliderFactory();
    settingsFormMarkup = settingsFormMarkup({ fbf: formBuilderFactory });
  }

  // Handle both FormRawMarkup (array) and FormMarkupWithSettings (object with components)
  const components: IConfigurableFormComponent[] | undefined = Array.isArray(settingsFormMarkup)
    ? settingsFormMarkup
    : settingsFormMarkup?.components;
  const formSettings = Array.isArray(settingsFormMarkup) ? undefined : settingsFormMarkup?.formSettings;

  if (!components) return null;

  const searchableTabs = components.find(isSearchableTabsMarkup);
  if (!searchableTabs) return null;

  const appearanceTab = searchableTabs.tabs.find(
    (tab) => tab.key === 'appearance' || tab.title?.toLowerCase() === 'appearance',
  );

  const tabComponents: unknown = appearanceTab?.components;
  const appearanceMarkupComponents: IConfigurableFormComponent[] | undefined = Array.isArray(tabComponents)
    ? tabComponents
    : isRawComponentsContainer(tabComponents)
      ? tabComponents.components
      : undefined;

  if (!appearanceMarkupComponents) return null;

  // Surface configured properties that live on other tabs (e.g. fileUpload's `listType`) so they
  // can be themed/previewed from the appearance panel. See ./appearanceAdapter.
  const extraComponents = getExtraAppearanceComponents(componentType, components);

  return {
    components: [...extraComponents, ...appearanceMarkupComponents],
    formSettings: formSettings ?? undefined,
  };
};

/**
 * Whether a component type exposes an Appearance tab (i.e. it is meaningfully styleable from the
 * Component Defaults panel). Used to filter the component menu.
 */
export const hasAppearanceSettings = (componentType: string | undefined): boolean =>
  !!getAppearanceMarkup(componentType)?.components?.length;
