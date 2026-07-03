import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import '../components/styles/Login.css';

import { Input } from '../components/ui/Input';
import { Logo } from '../components/common/Logo';
import { loginSchema } from '../utils/validators/auth';
import type { LoginFormData } from '../utils/validators/auth';

interface UserRecord {
  id: number;
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantId: 'amazonet' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/data/users.json');

      if (!response.ok) {
        throw new Error('Falha ao carregar usuarios');
      }

      const users = await response.json() as UserRecord[];
      const tenantId = data.tenantId.trim().toLowerCase();
      const email = data.email.trim().toLowerCase();

      const user = users.find((item) =>
        item.active &&
        item.tenantId.toLowerCase() === tenantId &&
        item.email.toLowerCase() === email &&
        item.password === data.password
      );

      if (!user) {
        setError('root', {
          type: 'manual',
          message: 'Empresa, e-mail ou senha invalidos.',
        });
        return;
      }

      const { password: _password, ...sessionUser } = user;
      localStorage.setItem('komissx_user', JSON.stringify(sessionUser));
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error(error);
      setError('root', {
        type: 'manual',
        message: 'Nao foi possivel autenticar agora. Tente novamente.',
      });
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
              {errors.root?.message && (
                <p className="auth-error">{errors.root.message}</p>
              )}

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
