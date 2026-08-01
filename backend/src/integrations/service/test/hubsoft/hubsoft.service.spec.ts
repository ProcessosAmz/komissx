import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HubsoftService } from '../../../hubsoft.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('HubsoftService', () => {
  let service: HubsoftService;
  let httpService: HttpService;

  // Mock do HttpService do NestJS
  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Define as variáveis de ambiente necessárias para o teste
    process.env.HUB_CLIENT_ID = 'test_id';
    process.env.HUB_CLIENT_SECRET = 'test_secret';
    process.env.HUB_GRANT_TYPE = 'password';
    process.env.HUB_USERNAME = 'user';
    process.env.HUB_PASSWORD = 'pwd';
    process.env.HUB_URL = 'https://api.hubsoft.com';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HubsoftService,
        {
          provide: HttpService,
          useValue: mockHttpService, // Injeta o nosso mock simulado
        },
      ],
    }).compile();

    service = module.get<HubsoftService>(HubsoftService);
    httpService = module.get<HttpService>(HttpService);
    
    // Limpa os mocks antes de cada teste para evitar interferências
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('buscarVendedores', () => {
    it('deve fazer login, salvar o token e buscar os vendedores com sucesso', async () => {
      // 1. Simula a resposta do Login (OAuth)
      const mockLoginResponse: Partial<AxiosResponse<any>> = {
        data: {
          access_token: 'token_valido_123',
          expires_in: 3600,
        },
      };
      mockHttpService.post.mockReturnValue(of(mockLoginResponse));

      // 2. Simula a resposta da busca de vendedores
      const mockVendedoresResponse: Partial<AxiosResponse<any>> = {
        data: [{ id: 1, nome: 'Vendedor Teste' }],
      };
      mockHttpService.get.mockReturnValue(of(mockVendedoresResponse));

      // 3. Executa a função
      const resultado = await service.buscarVendedores();

      // Asserts (Validações)
      expect(mockHttpService.post).toHaveBeenCalledTimes(1); // Garante que logou
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'rota/para/buscar/vendedores',
        { headers: { Authorization: 'Bearer token_valido_123' } } // Garante que usou o token no Header
      );
      expect(resultado).toEqual(mockVendedoresResponse.data);
    });

    it('NÃO deve fazer login novamente se o token ainda estiver válido', async () => {
      // Força o primeiro fluxo de login bem sucedido
      mockHttpService.post.mockReturnValue(of({ data: { access_token: 'token_1', expires_in: 3600 } }));
      mockHttpService.get.mockReturnValue(of({ data: [] }));

      // Primeira chamada (vai logar)
      await service.buscarVendedores();

      // Segunda chamada (NÃO deve chamar o post do login de novo, pois está válido)
      await service.buscarVendedores();

      expect(mockHttpService.post).toHaveBeenCalledTimes(1); // Chamado apenas 1 vez!
      expect(mockHttpService.get).toHaveBeenCalledTimes(2); // Mas buscou os vendedores 2 vezes
    });

    it('deve falhar se o login falhar', async () => {
      // Simula um erro na rota de login
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Erro de autenticação')));

      await expect(service.buscarVendedores()).rejects.toThrow('Erro de autenticação');
    });
  });
});