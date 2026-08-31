export type MetabaseParameterTarget =
  | ["variable", ["template-tag", string]]
  | ["dimension", ["template-tag", string]];

export interface MetabaseParameter {
  id?: string;
  type: string;
  value: unknown;
  target: MetabaseParameterTarget;
}
