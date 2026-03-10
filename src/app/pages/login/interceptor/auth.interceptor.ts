import { HttpInterceptorFn } from '@angular/common/http';

// Por enquanto não anexamos nenhum token nas requisições HTTP.
// Quando a API passar a validar o ID token do Firebase, podemos atualizar aqui.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};

