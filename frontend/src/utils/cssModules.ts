/**
 * CSS Modules 类名辅助工具。
 *
 * 背景：使用 CSS Modules 时，源码里写的语义类名（如 'radial-menu__node'）在编译后会被
 * 哈希成唯一名（'_radial-menu__node_1j3ey_153'），需要通过 `styles[key]` 映射取回。
 * 同时还常要按条件拼接（`isActive && 'xxx'`）并过滤掉假值。
 */

/** CSS Modules 编译产物的类型：语义类名 → 哈希后的真实类名。 */
export type CssModule = Record<string, string>;

/** cx 接受的单个参数：类名 key，或会被过滤掉的假值（便于写 `cond && 'key'`）。 */
export type ClassKey = string | false | null | undefined;

/**
 * 绑定一份 CSS Modules `styles`，返回一个把语义类名 key 映射为哈希类名并拼接的 `cx`。
 *
 * 之所以用工厂而非纯函数：`styles` 因文件而异，工厂在调用处绑定后即可像普通 cx 一样使用。
 * 未在 styles 中命中的 key 会被安全跳过（不会产出 `undefined` 字符串）。
 *
 * @example
 * const cx = createCx(styles);
 * cx('radial-menu__node', isActive && 'radial-menu__node--active');
 */
export const createCx =
  (styles: CssModule) =>
  (...keys: ClassKey[]): string =>
    keys
      .filter(Boolean)
      .map((key) => styles[key as string])
      .filter(Boolean)
      .join(' ');

/**
 * 通用类名拼接：仅过滤假值并以空格拼接，不做任何 CSS Modules 映射。
 * 适用于直接传入已是最终形态的类名（含已映射的 `styles.x` 或全局类名）的场景。
 *
 * @example
 * cx('base', isOpen && 'is-open', styles.card);
 */
export const cx = (...parts: ClassKey[]): string => parts.filter(Boolean).join(' ');
