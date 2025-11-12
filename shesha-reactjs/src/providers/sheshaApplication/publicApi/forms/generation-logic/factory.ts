import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { GenerationLogic } from "./interface";
import { DetailsViewGenerationLogic } from "./details-view/detailsViewGenerationLogic";
import { CreateViewGenerationLogic } from "./create-view/createViewGenerationLogic";
import { TableViewGenerationLogic } from "./table-view/tableViewGenerationLogic";
import { BaseGenerationLogic } from "./baseGenerationLogic";

/**
 * Factory for creating appropriate GenerationLogic implementations
 */
export class GenerationLogicFactory {
  private _implementations: GenerationLogic[] = [];

  private _logicConstructors: (new () => GenerationLogic)[] = [
    DetailsViewGenerationLogic,
    CreateViewGenerationLogic,
    TableViewGenerationLogic,
  ];

  constructor() {
    // Register all available implementations
    this.initializeImplementations();
  }

  /**
   * Initialize the available implementations from registered constructors
   */
  private initializeImplementations(): void {
    this._implementations = this._logicConstructors.map((Constructor) => new Constructor());
  }

  /**
   * Register a new GenerationLogic implementation
   * @param logicConstructor Constructor function for the GenerationLogic implementation
   */
  registerImplementation(logicConstructor: new () => GenerationLogic): void {
    // Check if the implementation is already registered
    if (!this._logicConstructors.includes(logicConstructor)) {
      this._logicConstructors.push(logicConstructor);
      this._implementations.push(new logicConstructor());
    }
  }

  /**
   * Get the appropriate generation logic for a template
   * @param template The form template requiring generation logic
   * @returns An appropriate GenerationLogic implementation
   */
  getGenerationLogic(template: FormConfigurationDto): GenerationLogic {
    // Find the first implementation that supports this template
    const logic = this._implementations.find((impl) => impl.supportsTemplate(template));

    // If no specific implementation is found, return a default implementation
    if (!logic) {
      return new DefaultGenerationLogic();
    }

    return logic;
  }
}

/**
 * Default implementation for templates without a specific handler
 */
class DefaultGenerationLogic extends BaseGenerationLogic {
  readonly typeName = "DefaultGenerationLogic";

  protected getModelTypeFromReplacements(_replacements: object): string | null {
    return null;
  }

  protected async addComponentsToMarkup(): Promise<void> {
    // Do nothing for default logic
  }

  override async processTemplate(markup: string, replacements: Record<string, any>): Promise<string> {
    // Override base implementation to just apply standard replacements
    const result = await Promise.resolve(evaluateString(markup, replacements, true));
    return result;
  }
}


