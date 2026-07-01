import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '../components/ui/Input';
import { loginSchema } from '../utils/validators/auth';
import type { LoginFormData } from '../utils/validators/auth';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: 'amazonet',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Dados validados e prontos para o Axios:', data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-brand" aria-label="Apresentacao KomissX">
          <div className="login-logo">KomissX</div>

          <div className="brand-copy">
            <h1>KomissX</h1>
            <p>
              Plataforma de Governanca de Comissoes e Regras de Negocio para
              Empresas de Tecnologia e Financas.
            </p>
          </div>

          <div className="brand-status">
            <span />
            Mecanismo de regras ativo v2.4
          </div>
        </section>

        <section className="login-panel" aria-label="Formulario de acesso">
          <div className="login-card">
            <h2>Acessar a Plataforma</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
                type="email"
                label="E-mail Corporativo"
                placeholder="nome@empresa.com"
                error={errors.email?.message}
                register={register('email')}
                disabled={isSubmitting}
              />

              <div className="field">
                <div className="field-row">
                  <label htmlFor="password">Senha</label>
                  <a href="#forgot" className="forgot-link">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="********"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={errors.password ? 'input-error' : undefined}
                />
                {errors.password && (
                  <p className="field-error">{errors.password.message}</p>
                )}
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
