/**
 * 仅供 scripts/ 下 bun 脚本使用的最小类型声明。
 * 真正的 bun 类型需要 npm install bun-types(当前沙箱不可达);
 * 这里手写一份契合本仓库脚本用到的子集。
 */
declare module 'bun:sqlite' {
  export interface DatabaseOptions {
    readonly?: boolean;
  }

  export interface Statement {
    all(): unknown[];
    get(): unknown;
  }

  export class Database {
    constructor(filename: string, options?: DatabaseOptions);
    query(sql: string): Statement;
    close(): void;
  }
}
