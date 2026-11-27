import type { IConfigurableFormComponent } from '@/providers/form/models';

/** Colour of the sample body text: plain black, whatever colour the theme gives Text components. */
const SAMPLE_TEXT_FONT = { color: '#000' };

/**
 * A Text component to put in a container of a preview, so the container's padding shows. It is plain
 * black text: the preview is about the container, so the theme's Text colour is not applied to it.
 */
export const getPreviewSampleText = (id: string, parentId: string, content = 'Content'): IConfigurableFormComponent => ({
  type: 'text',
  id,
  componentName: id,
  propertyName: id,
  parentId,
  hidden: false,
  content,
  contentType: 'custom',
  font: SAMPLE_TEXT_FONT,
  desktop: { contentType: 'custom', font: SAMPLE_TEXT_FONT },
  version: 'latest',
} as IConfigurableFormComponent);
