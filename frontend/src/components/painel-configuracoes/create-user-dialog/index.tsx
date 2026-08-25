import { useEffect } from "react";
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
import {
  createUserSchema,
  type CreateUserFormData,
  type CreateUserFormInput,
} from "@/utils/validators/user";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useEmpresas } from "@/hooks/useEmpresa";
import { useUnidades } from "@/hooks/useUnidade";
import { useRoles } from "@/hooks/useRoles";
import { useUsers } from "@/hooks/useUsers";
import { flattenUsers } from "@/utils/hierarquia";

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

const selectClassName =
  "w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed";

export type ResponsavelCriacao = {
  id: string;
  nome: string;
  cargo: "SUPERVISOR" | "LIDER";
  empresaId: string;
  unidadeId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responsavel?: ResponsavelCriacao | null;
};

function isSupervisorRole(roleName: string) {
  return roleName.toUpperCase().includes("SUPERVISOR");
}

function isLiderRole(roleName: string) {
  const normalized = roleName.toUpperCase();
  return normalized.includes("LIDER") || normalized.includes("LÍDER");
}

function hierarquiaHint(
  roleName: string,
  creatingSupervisor: boolean,
  creatingLider: boolean,
) {
  switch (true) {
    case !roleName:
      return "Selecione o cargo para definir se o usuário terá um responsável.";
    case creatingSupervisor:
      return "Supervisor fica no topo da hierarquia, sem responsável.";
    case creatingLider:
      return "O líder responde a um supervisor.";
    default:
      return "Este cargo responde a um líder ou diretamente a um supervisor.";
  }
}

export function NovoUsuarioDialog({ open, onOpenChange, responsavel }: Props) {
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInput, unknown, CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
      empresaId: "",
      unidadeId: "",
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
  const rolesDisponiveis = roles.filter((role) => {
    if (!responsavel) {
      return true;
    }

    if (isSupervisorRole(role.name)) {
      return false;
    }

    if (responsavel.cargo === "LIDER" && isLiderRole(role.name)) {
      return false;
    }

    return true;
  });
  const selectedRole = roles.find((role) => role.id === roleId);
  const selectedRoleName = selectedRole?.name ?? "";
  const creatingSupervisor = isSupervisorRole(selectedRoleName);
  const creatingLider = isLiderRole(selectedRoleName);
  const showResponsavel =
    Boolean(responsavel) || (Boolean(selectedRoleName) && !creatingSupervisor);
  const responsavelLabel = creatingLider ? "Supervisor" : "Líder ou supervisor";
  const lotacaoTravada = Boolean(responsavel);

  const colaboradores = flattenUsers(usersResponse?.data ?? []);
  const supervisores = colaboradores.filter((user) =>
    isSupervisorRole(user.roleName),
  );
  const lideres = colaboradores.filter((user) => isLiderRole(user.roleName));
  const responsaveis = creatingLider
    ? supervisores
    : [...supervisores, ...lideres];

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: "",
      email: "",
      password: "",
      roleId: "",
      empresaId: responsavel?.empresaId ?? "",
      unidadeId: responsavel?.unidadeId ?? "",
      supervisorId: responsavel?.id ?? null,
      participaFechamento: false,
      active: true,
    });
  }, [open, responsavel, reset]);

  useEffect(() => {
    if (responsavel) {
      setValue("supervisorId", responsavel.id);
      return;
    }

    setValue("supervisorId", null);
  }, [roleId, responsavel, setValue]);

  const onSubmit = async (data: CreateUserFormData) => {
    if (showResponsavel && !data.supervisorId) {
      setError("supervisorId", {
        message: `Informe o ${responsavelLabel.toLowerCase()}.`,
      });
      return;
    }

    await createUser.mutateAsync({
      ...data,
      supervisorId: creatingSupervisor ? null : data.supervisorId,
      active: true,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription className="text-slate-400">
            {responsavel
              ? `O novo usuário vai responder a ${responsavel.nome}.`
              : hierarquiaHint(
                  selectedRoleName,
                  creatingSupervisor,
                  creatingLider,
                )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Dados do usuário
            </h3>
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
                <select className={selectClassName} {...register("roleId")}>
                  <option value="">Selecione</option>
                  {rolesDisponiveis.map((role) => (
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
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Lotação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Empresa
                </label>
                <select
                  className={selectClassName}
                  disabled={lotacaoTravada}
                  {...register("empresaId")}
                  onChange={(event) => {
                    setValue("empresaId", event.target.value);
                    setValue("unidadeId", "");
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
                  disabled={lotacaoTravada || !empresaId}
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
            </div>
          </section>

          {showResponsavel ? (
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Hierarquia
              </h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {responsavelLabel}
                </label>
                {responsavel ? (
                  <>
                    <p className="h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-100 flex items-center">
                      {responsavel.nome}
                    </p>
                    <input type="hidden" {...register("supervisorId")} />
                  </>
                ) : (
                  <select className={selectClassName} {...register("supervisorId")}>
                    <option value="">Selecione</option>
                    {responsaveis.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.name}
                      </option>
                    ))}
                  </select>
                )}
                {!responsavel && responsaveis.length === 0 ? (
                  <p className="text-[11px] text-amber-400">
                    {creatingLider
                      ? "Cadastre um supervisor antes de criar um líder."
                      : "Cadastre um líder ou um supervisor antes de criar este cargo."}
                  </p>
                ) : null}
                {errors.supervisorId && (
                  <p className="text-[11px] text-red-400">
                    {errors.supervisorId.message}
                  </p>
                )}
              </div>
            </section>
          ) : null}

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
              {createUser.isPending ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}