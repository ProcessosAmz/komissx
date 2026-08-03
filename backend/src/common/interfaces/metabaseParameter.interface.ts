export interface MetabaseParameter {
  type: string;
  value: unknown;
  target: ["variable", ["template-tag", string]];
}
