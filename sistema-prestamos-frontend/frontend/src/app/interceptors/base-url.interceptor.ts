import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../core/services/config.service';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const configService = inject(ConfigService);
  const baseUrl = configService.apiUrl;

  if (baseUrl && (req.url.startsWith('/api') || req.url.startsWith('/auth') || req.url.startsWith('/uploads'))) {
    const apiReq = req.clone({ url: `${baseUrl}${req.url}` });
    return next(apiReq);
  }
  return next(req);
};
