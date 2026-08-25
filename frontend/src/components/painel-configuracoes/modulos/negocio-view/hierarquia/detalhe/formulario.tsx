import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmpresas } from "@/hooks/useEmpresa";
import { useRoles } from "@/hooks/useRoles";
import { useUnidades } from "@/hooks/useUnidade";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useUsers } from "@/hooks/useUsers";
import { HierarquiaNode } from "@/types/cargo";
import {
  coletarIdsDescendentes,
  flattenUsers,
  isLiderRole,
  isSupervisorRole,
} from "@/utils/hierarquia";
import {
  updateUserSchema,
  type UpdateUserFormData,
  type UpdateUserFormInput,
} from "@/utils/validators/user";

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed";

type FormularioColaboradorProps = {
  selecionado: HierarquiaNode;
  readOnly?: boolean;
};

function toFormValues(selecionado: HierarquiaNode): UpdateUserFormInput {
  return {
    name: selecionado.nome,
    email: selecionado.email,
    password: undefined,
    hubsoftId: selecionado.idHubsoft ? Number(selecionado.idHubsoft) : undefined,
    roleId: selecionado.roleId,
    empresaId: selecionado.empresaId,
    unidadeId: selecionado.unidadeId,
    supervisorId: selecionado.supervisorId,
    participaFechamento: selecionado.participaFechamento,
    active: true,
  };
}

export function FormularioColaborador({
  selecionado,
  readOnly = false,
}: FormularioColaboradorProps) {
  const updateUser = useUpdateUser();
  const { data: empresasResponse } = useEmpresas();
  const { data: rolesResponse } = useRoles();
  const { data: usersResponse } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormInput, unknown, UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: toFormValues(selecionado),
  });

  const empresaId = watch("empresaId");
  const roleId = watch("roleId");
  const participaFechamento = watch("participaFechamento");
  const { data: unidadesResponse } = useUnidades({ empresaId });

  useEffect(() => {
    reset(toFormValues(selecionado));
  }, [selecionado, reset]);

  const empresas = empresasResponse?.data ?? [];
  const unidades = unidadesResponse?.data ?? [];
  const roles = rolesResponse?.data ?? [];
  const selectedRole = roles.find((role) => role.id === roleId);
  const selectedRoleName = selectedRole?.name ?? selecionado.cargo;
  const editingSupervisor = isSupervisorRole(selectedRoleName);
  const editingLider = isLiderRole(selectedRoleName);
  const showResponsavel = Boolean(selectedRoleName) && !editingSupervisor;
  const responsavelLabel = editingLider ? "Supervisor" : "Líder ou supervisor";

  const blockedIds = new Set([
    selecionado.id,
    ...coletarIdsDescendentes(selecionado),
  ]);
  const colaboradores = flattenUsers(usersResponse?.data ?? []).filter(
    (user) => !blockedIds.has(user.id),
  );
  const supervisores = colaboradores.filter((user) =>
    isSupervisorRole(user.roleName),
  );
  const lideres = colaboradores.filter((user) => isLiderRole(user.roleName));
  const responsaveis = editingLider ? supervisores : [...supervisores, ...lideres];

  const onSubmit = async (data: UpdateUserFormData) => {
    if (readOnly) {
      return;
    }

    if (showResponsavel && !data.supervisorId) {
      setError("supervisorId", {
        message: `Informe o ${responsavelLabel.toLowerCase()}.`,
      });
      return;
    }

    await updateUser.mutateAsync({
      userId: selecionado.id,
      payload: {
        ...data,
        supervisorId: editingSupervisor ? null : data.supervisorId,
        password: data.password || undefined,
        active: true,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-70">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
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
              Cargo
            </label>
            <select
              className={selectClassName}
              {...register("roleId")}
              onChange={(event) => {
                const nextRoleId = event.target.value;
                const nextRole = roles.find((role) => role.id === nextRoleId);
                const nextRoleName = nextRole?.name ?? "";

                setValue("roleId", nextRoleId, { shouldDirty: true });

                if (isSupervisorRole(nextRoleName)) {
                  setValue("supervisorId", null, { shouldDirty: true });
                  return;
                }

                if (nextRoleId !== selecionado.roleId) {
                  setValue("supervisorId", null, { shouldDirty: true });
                }
              }}
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
              Nova senha
            </label>
            <Input
              type="password"
              placeholder="Deixe em branco para manter"
              className={inputClassName}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[11px] text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Empresa
            </label>
            <select
              className={selectClassName}
              {...register("empresaId")}
              onChange={(event) => {
                setValue("empresaId", event.target.value, { shouldDirty: true });
                setValue("unidadeId", "", { shouldDirty: true });
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
              className={selectClassName}
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ID Hubsoft
            </label>
            <Input type="number" className={inputClassName} {...register("hubsoftId")} />
            {errors.hubsoftId && (
              <p className="text-[11px] text-red-400">{errors.hubsoftId.message}</p>
            )}
          </div>

          {showResponsavel ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {responsavelLabel}
              </label>
              <select className={selectClassName} {...register("supervisorId")}>
                <option value="">Selecione</option>
                {responsaveis.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.name}
                  </option>
                ))}
              </select>
              {errors.supervisorId && (
                <p className="text-[11px] text-red-400">
                  {errors.supervisorId.message}
                </p>
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
      </fieldset>

      {!readOnly ? (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || updateUser.isPending || !isDirty}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {updateUser.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}