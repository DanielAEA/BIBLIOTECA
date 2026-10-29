import { Injectable } from '@angular/core';
import { PublicClientApplication, Configuration, BrowserAuthError } from '@azure/msal-browser';
import { ConfigService } from '../core/services/config.service';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {

  private msalInstance: PublicClientApplication | null = null;
  private isMsalInitialized = false;

  constructor(private configService: ConfigService) {}

  private async getMsalInstance(): Promise<PublicClientApplication> {
    const clientId = this.configService.microsoftClientId;
    if (!clientId) {
      throw new Error('Microsoft Client ID no está configurado en el sistema.');
    }

    if (!this.msalInstance) {
      const msalConfig: Configuration = {
        auth: {
          clientId,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin
        },
        cache: {
          cacheLocation: 'sessionStorage'
        }
      };
      this.msalInstance = new PublicClientApplication(msalConfig);
    }

    if (!this.isMsalInitialized) {
      await this.msalInstance.initialize();
      this.isMsalInitialized = true;
    }

    return this.msalInstance;
  }

  async loginWithMicrosoft(): Promise<string> {
    try {
      const msal = await this.getMsalInstance();
      const response = await msal.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account'
      });

      if (!response || !response.idToken) {
        throw new Error('No se recibió el token de identidad de Microsoft.');
      }

      return response.idToken;
    } catch (err: any) {
      if (err instanceof BrowserAuthError) {
        if (err.errorCode === 'user_cancelled') {
          throw new Error('El usuario cerró la ventana de inicio de sesión.');
        }
        if (err.errorCode === 'popup_window_error') {
          throw new Error('Ventana emergente bloqueada. Habilita las ventanas emergentes en tu navegador.');
        }
      }
      if (err?.message?.includes('user_cancelled')) {
        throw new Error('El usuario cerró la ventana de inicio de sesión.');
      }
      throw new Error(err.message || 'Error al iniciar sesión con Microsoft.');
    }
  }

  async loginWithGoogle(): Promise<string> {
    const clientId = this.configService.googleClientId;
    if (!clientId) {
      throw new Error('Google Client ID no está configurado en el sistema.');
    }

    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google?.accounts?.id) {
        return reject(new Error('El servicio de Google no se ha cargado. Verifica tu conexión o deshabilita bloqueadores de anuncios.'));
      }

      let resolved = false;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response && response.credential) {
            resolved = true;
            resolve(response.credential);
          } else {
            reject(new Error('No se recibió una credencial válida de Google.'));
          }
        },
        cancel_on_tap_outside: false
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          if (!resolved) {
            reject(new Error('No se pudo mostrar la ventana de Google. Revisa si las ventanas emergentes o cookies de terceros están bloqueadas.'));
          }
        }
        if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
          if (!resolved) {
            reject(new Error('El usuario cerró la ventana o canceló la autenticación con Google.'));
          }
        }
      });
    });
  }
}
