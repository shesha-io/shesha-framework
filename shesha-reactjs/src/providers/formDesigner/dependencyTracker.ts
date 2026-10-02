import { FormDependency } from "@/components/formsValidator/models";
import { ConfigurableItemFullName, isConfigurableItemFullName, isValidConfigurableItemIdentifier } from "@/interfaces";
import { IDependenciesTracker } from "./formValidator";
import { isDefined, isNullOrWhiteSpace } from "@/utils";

export class DependenciesTracker implements IDependenciesTracker {
  #dependencies: Map<string, FormDependency> = new Map<string, FormDependency>();

  get dependencies(): FormDependency[] {
    return [...this.#dependencies.values()];
  };

  keyOf = (dependency: FormDependency): string => {
    return `${dependency.type}\u0000${dependency.module ?? ''}\u0000${dependency.name}`;
  };

  add = (dependency: FormDependency): void => {
    const key = this.keyOf(dependency);
    const existing = this.#dependencies.get(key);
    if (isDefined(existing)) {
      existing.isSatisfied = existing.isSatisfied && dependency.isSatisfied;
      existing.hasIssues = (existing.hasIssues ?? false) || dependency.isSatisfied;
    } else
      this.#dependencies.set(key, dependency);
  };

  addEntityReference = (entityType: ConfigurableItemFullName | string, isSatisfied: boolean): void => {
    if (!isValidConfigurableItemIdentifier(entityType))
      return;

    if (isConfigurableItemFullName(entityType)) {
      this.add({ type: 'entity', module: entityType.module, name: entityType.name, isSatisfied });
    } else {
      this.add({ type: 'entity', module: 'null', name: String(entityType), isSatisfied });
    }
  };

  addReferenceList = (id: ConfigurableItemFullName, isSatisfied: boolean): void => {
    if (!isValidConfigurableItemIdentifier(id))
      return;
    this.add({ type: 'ref-list', module: id.module, name: id.name, isSatisfied });
  };

  addForm = (id: ConfigurableItemFullName, isSatisfied: boolean): void => {
    if (!isValidConfigurableItemIdentifier(id))
      return;
    this.add({ type: 'form', module: id.module, name: id.name, isSatisfied });
  };

  addFormComponent = (type: string, isSatisfied: boolean, hasIssues: boolean): void => {
    if (isNullOrWhiteSpace(type))
      return;

    this.add({
      type: 'form-component',
      module: null,
      name: type,
      isSatisfied,
      hasIssues,
    });
  };
};
