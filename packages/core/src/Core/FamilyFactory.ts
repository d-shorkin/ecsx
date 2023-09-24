import {
  ComponentConstructor,
  ComponentFilter,
  IEngine,
  IFamily,
  IFamilyFactory
} from "../Contract/Core";
import {Family} from "./Family";
import {parseFilter} from "./Helpers";

type Families = { [p: string]: IFamily };

export class FamilyFactory implements IFamilyFactory {
  private families: Families = {};

  constructor(private engine: IEngine) {
  }

  createFamily(...components: ComponentFilter): IFamily {
    if (!components.length) {
      return this.engine.getCommonFamily()
    }

    let key = '';

    const {exclude, include} = parseFilter(components)

    key += 'i:' + include.map(c => c.tag || c.name).join(',');
    key += 'e:' + exclude.map(c => c.tag || c.name).join(',');

    if (!this.families[key]) {
      this.families[key] = new Family(this.engine, include, exclude);
    }

    return this.families[key];
  }
}
