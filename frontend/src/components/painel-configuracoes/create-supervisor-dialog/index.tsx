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

const SUPERVISOR_ROLE_ID = 1;

const EMPRESAS = [
  { id: 1, label: "AMAZONET" },
  { id: 2, label: "MANIA" },
];

const REGIONAIS = [
  { id: 1, label: "MANAUS" },
  { id: 2, label: "SANTARÉM" },
];

const inputClassName =
  "h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs text-slate-100";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NovoSupervisorDialog({ open, onOpenChange }: Props) {
  const createUser = useCreateUser();

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
      hubsoftId: undefined as unknown as number,
      roleId: SUPERVISOR_ROLE_ID,
      operadoraId: 1,
      regionalId: 1,
      supervisorId: null,
      participaFechamento: false,
      active: true,
    },
  });

  const participaFechamento = watch("participaFechamento");

  const onSubmit = async (data: CreateUserFormData) => {
    await createUser.mutateAsync({
      ...data,
      roleId: SUPERVISOR_ROLE_ID,
      supervisorId: null,
      active: true,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo supervisor</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados para criar o usuário com cargo SUPERVISOR.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Nome
              </label>
              <Input
                className={inputClassName}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                className={inputClassName}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Senha
              </label>
              <Input
                type="password"
                className={inputClassName}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-[11px] text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Cargo
              </label>
              <Input
                value="SUPERVISOR"
                disabled
                className="h-9 rounded-xl border-slate-800 bg-[#03050a] text-xs opacity-70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ID Hubsoft
              </label>
              <Input
                type="number"
                className={inputClassName}
                {...register("hubsoftId")}
              />
              {errors.hubsoftId && (
                <p className="text-[11px] text-red-400">{errors.hubsoftId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Operadora
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                {...register("operadoraId")}
              >
                {EMPRESAS.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.label}
                  </option>
                ))}
              </select>
              {errors.operadoraId && (
                <p className="text-[11px] text-red-400">{errors.operadoraId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Regional
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                {...register("regionalId")}
              >
                {REGIONAIS.map((regional) => (
                  <option key={regional.id} value={regional.id}>
                    {regional.label}
                  </option>
                ))}
              </select>
              {errors.regionalId && (
                <p className="text-[11px] text-red-400">{errors.regionalId.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2.5">
            <span className="text-xs text-slate-300">
              Participa fechamento mensal
            </span>
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

          <input type="hidden" {...register("roleId")} />
          <input type="hidden" {...register("active")} />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createUser.isPending}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {createUser.isPending ? "Criando..." : "Criar supervisor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}