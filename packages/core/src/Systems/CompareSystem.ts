import {ComponentConstructor, IComponent, IEngine, IFamily, ISystem, NotComponent} from "../Contract/Core";
import {NullFamily} from "../Core/Helpers";
import {IComparator} from "../Contract/Repository";

export class CompareSystem<T> implements ISystem {
  private comparator: IComparator<T>;
  private components: Array<ComponentConstructor<IComponent> | NotComponent<IComponent>>;
  private entities: IFamily = NullFamily;

  constructor(comparator: IComparator<T>, ...components: Array<ComponentConstructor<IComponent> | NotComponent<IComponent>>) {
    this.comparator = comparator;
    this.components = components;
  }

  onAttach(engine: IEngine): void {
    this.entities = engine.createFamily(...this.components);
  }

  execute(engine: IEngine, delta: number): void {
    this.entities.getEntities().forEach(this.comparator.compare.bind(this.comparator));
    this.comparator.clear();
  }

}