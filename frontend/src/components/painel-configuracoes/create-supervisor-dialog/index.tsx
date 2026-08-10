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
import { useCreateUser } from "@/hook/useCreateUser";

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

  // const {
  //   register,
  //   handleSubmit,
  //   reset,
  //   watch,
  //   setValue,
  //   formState: { errors, isSubmitting },
  // } = useForm<CreateUserFormData>({
  //   resolver: zodResolver(createUserSchema),
  //   defaultValues: {
  //     name: "",
  //     email: "",
  //     password: "",
  //     hubsoftId: 0,
  //     roleId: SUPERVISOR_ROLE_ID.toString(),
  //     empresaId: "1",
  //     regionalId: "1",
  //     supervisorId: null,
  //     participaFechamento: false,
  //     active: true,
  //   },
  // });



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#090d16] border-slate-800 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo supervisor</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados para criar o usuário com cargo SUPERVISOR.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={() => console.log("submit")} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Nome
              </label>
              <Input
                className={inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                className={inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Senha
              </label>
              <Input
                type="password"
                className={inputClassName}
              />
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
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Empresa
              </label>
              <select 
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
              >
                {EMPRESAS.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Regional
              </label>
              <select
                className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
              >
                {REGIONAIS.map((regional) => (
                  <option key={regional.id} value={regional.id}>
                    {regional.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2.5">
            <span className="text-xs text-slate-300">
              Participa fechamento mensal
            </span>
            <button
              type="button"
              className={`relative h-5 w-9 rounded-full transition-colors ${
                "bg-indigo-500"
              }`}
              aria-label="Participa fechamento mensal"
              onClick={() =>
                console.log("click")
              }
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  "left-4"
                }`}
              />
            </button>
          </div>

          <input type="hidden" value={SUPERVISOR_ROLE_ID.toString()} />
          <input type="hidden" value="true" name="participaFechamento" />

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
              disabled={createUser.isPending}
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