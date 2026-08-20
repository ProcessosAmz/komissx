import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserSchema, type CreateUserFormData } from "@/utils/validators/user";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useEmpresas } from "@/hooks/useEmpresa";
import { useUnidades } from "@/hooks/useUnidade";
import { useRoles } from "@/hooks/useRoles";
import { useUsers } from "@/hooks/useUsers";
import { flattenUsers } from "@/utils/hierarquia";

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isSupervisorRole(roleName: string) {
  return roleName.toUpperCase().includes("SUPERVISOR");
}

function isLiderRole(roleName: string) {
  const normalized = roleName.toUpperCase();
  return normalized.includes("LIDER") || normalized.includes("LÍDER");
}

export function NovoSupervisorDialog({ open, onOpenChange }: Props) {
  const createUser = useCreateUser();
  const { data: empresasResponse } = useEmpresas();
  const { data: rolesResponse } = useRoles();
  const { data: usersResponse } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: undefined as unknown as string,
      empresaId: undefined as unknown as string,
      unidadeId: undefined as unknown as string,
      supervisorId: null,
      participaFechamento: false,
      active: true,
    },
  });

  const empresaId = watch("empresaId");
  const roleId = watch("roleId");
  const participaFechamento = watch("participaFechamento");
  const { data: unidadesResponse } = useUnidades({ empresaId });

  const empresas = empresasResponse?.data ?? [];
  const unidades = unidadesResponse?.data ?? [];
  const roles = rolesResponse?.data ?? [];
  const selectedRole = roles.find((role) => role.id === roleId);
  const selectedRoleName = selectedRole?.name ?? "";
  const creatingSupervisor = isSupervisorRole(selectedRoleName);
  const creatingLider = isLiderRole(selectedRoleName);

  const colaboradores = flattenUsers(usersResponse?.data ?? []);
  const supervisores = colaboradores.filter((user) =>
    isSupervisorRole(user.roleName),
  );
  const lideres = colaboradores.filter((user) => isLiderRole(user.roleName));

  const onSubmit = async (data: CreateUserFormData) => {
    await createUser.mutateAsync({
      ...data,
      supervisorId: creatingSupervisor ? null : data.supervisorId,
      active: true,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo colaborador</DialogTitle>
          <DialogDescription className="text-slate-400">
            Supervisor fica sem pai. Líder aponta para o supervisor. Os demais apontam para o líder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Nome
              </label>
              <Input className={inputClassName} {...register("name")} />
              {errors.name && (
                <p className="text-[11px] text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <Input type="email" className={inputClassName} {...register("email")} />
              {errors.email && (
                <p className="text-[11px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Senha
              </label>
              <Input type="password" className={inputClassName} {...register("password")} />
              {errors.password && (
                <p className="text-[11px] text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Cargo
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                {...register("roleId")}
              >
                <option value="">Selecione</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-[11px] text-red-400">{errors.roleId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ID Hubsoft
              </label>
              <Input type="number" className={inputClassName} {...register("hubsoftId")} />
              {errors.hubsoftId && (
                <p className="text-[11px] text-red-400">{errors.hubsoftId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Empresa
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                {...register("empresaId")}
                onChange={(event) => {
                  setValue("empresaId", event.target.value);
                  setValue("unidadeId", undefined as unknown as string);
                }}
              >
                <option value="">Selecione</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.name}
                  </option>
                ))}
              </select>
              {errors.empresaId && (
                <p className="text-[11px] text-red-400">{errors.empresaId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Unidade
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                disabled={!empresaId}
                {...register("unidadeId")}
              >
                <option value="">Selecione</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.name}
                  </option>
                ))}
              </select>
              {errors.unidadeId && (
                <p className="text-[11px] text-red-400">{errors.unidadeId.message}</p>
              )}
            </div>

            {!creatingSupervisor ? (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {creatingLider ? "Supervisor" : "Líder"}
                </label>
                <select
                  className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                  {...register("supervisorId")}
                >
                  <option value="">Selecione</option>
                  {(creatingLider ? supervisores : lideres).map((colaborador) => (
                    <option key={colaborador.id} value={colaborador.id}>
                      {colaborador.name}
                    </option>
                  ))}
                </select>
                {errors.supervisorId && (
                  <p className="text-[11px] text-red-400">{errors.supervisorId.message}</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2.5">
            <span className="text-xs text-slate-300">Participa fechamento mensal</span>
            <button
              type="button"
              className={`relative h-5 w-9 rounded-full transition-colors ${
                participaFechamento ? "bg-indigo-500" : "bg-slate-700"
              }`}
              aria-label="Participa fechamento mensal"
              onClick={() =>
                setValue("participaFechamento", !participaFechamento, {
                  shouldDirty: true,
                })
              }
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  participaFechamento ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <input type="hidden" {...register("active")} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createUser.isPending}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {createUser.isPending ? "Criando..." : "Criar colaborador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}