import logoImg from '../../assets/Logo.png'; // Ajuste o caminho conforme a sua estrutura de pastas

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', /*showText = false */ }: LogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Imagem do Logo */}
      <img
        src={logoImg}
        alt="KomissX Logo"
        className="h-7 w-auto object-contain" // Ajuste a altura (h-7) para bater com o tamanho visual antigo
      />

      {/* Texto opcional (caso queira manter a lógica de exibir/esconder o nome junto ao logo) */}
      {/*showText && (
        <span className="ml-2 text-lg font-semibold tracking-tight text-white hover:text-slate-200 transition-colors">
          -
        </span>
      )*/}
    </div>
  );
}