import Repository from './repository.ts'
import Package from '../package/package.ts'
import Config from "../config.ts";

export default class CacheRepository implements Repository {
  readonly name = `cacheRepo for ${this.repository?.name}`;

  private cache:Map<string, Package> = new Map();

  // eslint-disable-next-line no-useless-constructor
  constructor(
      private config:Config,
      private repository: Repository
  ) {}

  resolvePackage(packageName: string): Package | undefined {
    if (this.cache.has(packageName)) {
      return this.cache.get(packageName);
    }
    
    if (!this.repository) {
      return undefined
    }

    const pkg = this.repository.resolvePackage(packageName)
    if (pkg) {
      this.cache.set(packageName, pkg);
    }

    return pkg;
  }
}
