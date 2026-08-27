export type MetabaseParameterTarget =
  | ["variable", ["template-tag", string]]
  | ["dimension", ["template-tag", string]];

export interface MetabaseParameter {
  type: string;
  value: unknown;
  target: MetabaseParameterTarget;
}
