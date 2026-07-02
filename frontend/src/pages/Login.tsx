import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import '../components/styles/Login.css';

import { Input } from '../components/ui/Input';
import { Logo } from '../components/common/Logo';
import { loginSchema } from '../utils/validators/auth';
import type { LoginFormData } from '../utils/validators/auth';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantId: 'amazonet' },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Sua lógica de login aqui...
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        
        {/* LADO ESQUERDO: Branding */}
        <section className="login-brand" aria-label="Informações institucionais">
          <div className="login-logo">
            <Logo showText={true} />
          </div>

          <div className="logo-divider" aria-hidden="true" />

          <div className="brand-copy">
            <p>
              Plataforma corporativa para governança inteligente de comissões e 
              automação de regras de negócio complexas.
            </p>
          </div>

          <div className="brand-status">
            <span aria-hidden="true" />
            Mecanismo de regras ativo v1.0
          </div>
        </section>

        {/* LADO DIREITO: Formulário */}
        <section className="login-panel" aria-label="Formulário de acesso">
          <div className="login-card">
            <h2>Acessar a Plataforma</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
              <Input
                id="tenantId"
                label="Empresa (Tenant ID)"
                placeholder="amazonet"
                error={errors.tenantId?.message}
                register={register('tenantId')}
                disabled={isSubmitting}
              />

              <Input
                id="email"
                label="E-mail Corporativo"
                type="email"
                placeholder="nome@empresa.com"
                error={errors.email?.message}
                register={register('email')}
                disabled={isSubmitting}
              />

              <div className="password-wrapper">
                <Input
                  id="password"
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  register={register('password')}
                  disabled={isSubmitting}
                />
                <a href="#recuperar" className="forgot-link">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-submit"
              >
                {isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}