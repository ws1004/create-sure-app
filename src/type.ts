export interface FrameworkItem {
  name: string
  color(str: string | number): string
  variants?: FrameworkItem[]
}
