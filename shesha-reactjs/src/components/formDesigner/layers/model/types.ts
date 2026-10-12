type LayerNodeKind = 'component' | 'pane';

export interface ILayerNode {
  /** Component id, or the container id for pane rows */
  id: string;
  kind: LayerNodeKind;
  /** Tree parent (a component or a pane); null at the top level */
  parentId: string | null;
  /** Component rows: the flat-markup container the component sits in (ROOT_COMPONENT_KEY at the top level) */
  containerId?: string | undefined;
  /** Pane rows: the component that owns the pane */
  ownerId?: string | undefined;
  /** Tree children, in canvas order */
  childIds: string[];
  depth: number;
  /** Where "inside" drops go: the component's own container, or the pane itself. Undefined when nothing can go inside */
  dropContainerId?: string | undefined;
  /** Component rows whose children live in panes (Tabs, Wizard, Columns, Collapsible Panel) */
  hasPanes: boolean;
  /** Plural used in "Drop it into one of the tabs." */
  paneNoun?: string | undefined;
}

export interface ILayersIndex {
  rootIds: string[];
  nodes: ReadonlyMap<string, ILayerNode>;
}

export interface ILayerRow {
  id: string;
  depth: number;
  /** 1-based position among the visible siblings (aria-posinset) */
  posInSet: number;
  /** Number of visible siblings (aria-setsize) */
  setSize: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLastInGroup: boolean;
}
