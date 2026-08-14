import logoImg from '@/assets/Logo.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Apenas uma imagem com a classe customizada definida no index.css */}
      <img
        src={logoImg}
        alt="KomissX Logo"
        className="komissx-logo-img"
      />
    </div>
  );
}