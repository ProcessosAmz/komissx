import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

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
    defaultValues: {
      tenantId: 'amazonet',
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/data/users.json');
      const users = await response.json();

      // Busca e validação do usuário baseado no JSON local
      const user = users.find(
        (u: any) =>
          u.active &&
          u.tenantId.toLowerCase() === data.tenantId.toLowerCase() &&
          u.email.toLowerCase() === data.email.toLowerCase() &&
          u.password === data.password
      );

      if (!user) {
        alert('Usuário ou senha inválidos');
        return;
      }

      // Persistência dos dados de sessão local
      localStorage.setItem('komissx_user', JSON.stringify(user));

      alert(`Bem-vindo, ${user.name}!`);

      // Redireciona para o painel administrativo
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert('Erro ao autenticar no sistema');
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">

        {/* LADO ESQUERDO: Apresentação da marca */}
        <section className="login-brand" aria-label="Apresentação KomissX">

          {/* Logo do fluxo centralizador configurado via CSS */}
          <div className="login-logo">
            <Logo showText={true} />
          </div>

          <div className="logo-divider" />

          {/* Texto de Copy centralizado */}
          <div className="brand-copy">
            <h1>KOMISSX</h1>
            <p>
              Plataforma corporativa para governança inteligente de comissões
              e automação de regras de negócio complexas.
            </p>
          </div>

          {/* Tag do rodapé recuperada */}
          <div className="brand-status">
            <span />
            Mecanismo de regras ativo v1.0
          </div>
        </section>

        {/* LADO DIREITO: Painel de inputs */}
        <section className="login-panel" aria-label="Formulário de acesso">
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
                    Esqueceu a senha?
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