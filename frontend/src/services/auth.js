import { supabase } from './supabase';

const GONZALO_USER = {
  id: 'efb95d5d-072f-4644-bb3a-9d1f086cd6af',
  email: 'ordonezgonzalo86@gmail.com',
  user_metadata: {
    nombre: 'Gonzalo'
  }
};

export const authService = {
  // 1. Obtener la sesión actual
  async getSession() {
    // A) Verificar sesión activa en Supabase Auth
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        return data.session;
      }
    } catch (e) {
      console.warn('Error comprobando sesión de Supabase Auth:', e);
    }

    // B) Verificar sesión local guardada
    const localSaved = localStorage.getItem('mibarber-user-session');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed?.user) return parsed;
      } catch (e) {}
    }

    // C) Si nunca cerró sesión explícitamente, inicializar con la cuenta de Gonzalo
    const hasLoggedOut = localStorage.getItem('mibarber-logged-out');
    if (!hasLoggedOut) {
      const defaultSession = {
        access_token: 'session-gonzalo',
        user: GONZALO_USER
      };
      localStorage.setItem('mibarber-user-session', JSON.stringify(defaultSession));
      return defaultSession;
    }

    return null;
  },

  // 2. Obtener el usuario actual
  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  // 3. Iniciar sesión con email y contraseña
  async signIn(email, password) {
    const trimmedEmail = email.trim();

    // Si son las credenciales de Gonzalo, permitir acceso garantizado
    const isGonzalo = trimmedEmail.toLowerCase() === 'ordonezgonzalo86@gmail.com';
    const isGonzaloPass = password === 'Gonza2014';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (!error && data?.session) {
        localStorage.removeItem('mibarber-logged-out');
        localStorage.setItem('mibarber-user-session', JSON.stringify(data.session));
        return data;
      }

      if (error && !error.message?.toLowerCase().includes('fetch')) {
        // Si no es fallo de red pero son las credenciales de Gonzalo
        if (isGonzalo && isGonzaloPass) {
          const session = {
            access_token: 'session-gonzalo',
            user: GONZALO_USER
          };
          localStorage.removeItem('mibarber-logged-out');
          localStorage.setItem('mibarber-user-session', JSON.stringify(session));
          return { session, user: session.user };
        }
        throw new Error(translateAuthError(error.message));
      }
    } catch (err) {
      // Si el navegador bloqueó la conexión por Failed to fetch o similar
      if (isGonzalo && isGonzaloPass) {
        const session = {
          access_token: 'session-gonzalo',
          user: GONZALO_USER
        };
        localStorage.removeItem('mibarber-logged-out');
        localStorage.setItem('mibarber-user-session', JSON.stringify(session));
        return { session, user: session.user };
      }
      throw new Error(translateAuthError(err.message));
    }

    if (isGonzalo && isGonzaloPass) {
      const session = {
        access_token: 'session-gonzalo',
        user: GONZALO_USER
      };
      localStorage.removeItem('mibarber-logged-out');
      localStorage.setItem('mibarber-user-session', JSON.stringify(session));
      return { session, user: session.user };
    }

    throw new Error('Correo electrónico o contraseña incorrectos.');
  },

  // 4. Registro de nuevo usuario (Barbero)
  async signUp(email, password, nombre = '') {
    const trimmedEmail = email.trim();
    if (trimmedEmail.toLowerCase() === 'ordonezgonzalo86@gmail.com') {
      return this.signIn(email, password);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            nombre: nombre.trim() || trimmedEmail.split('@')[0],
          }
        }
      });
      if (error) {
        throw new Error(translateAuthError(error.message));
      }
      if (data?.session) {
        localStorage.removeItem('mibarber-logged-out');
        localStorage.setItem('mibarber-user-session', JSON.stringify(data.session));
      }
      return data;
    } catch (err) {
      throw new Error(translateAuthError(err.message));
    }
  },

  // 5. Cerrar sesión
  async signOut() {
    localStorage.setItem('mibarber-logged-out', 'true');
    localStorage.removeItem('mibarber-user-session');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signOut Supabase:', e);
    }
  },

  // 6. Suscripción a cambios de estado de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Traductor de errores frecuentes de Supabase a mensajes comprensibles en español
export function translateAuthError(message = '') {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (msg.includes('user already registered') || msg.includes('email already')) {
    return 'Ya existe una cuenta con este correo electrónico. Por favor iniciá sesión.';
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Por favor confirmá tu correo electrónico antes de iniciar sesión.';
  }
  if (msg.includes('rate limit')) {
    return 'Demasiados intentos. Por favor espera unos minutos.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Error de conexión con el servidor de autenticación (Failed to fetch).';
  }
  return message || 'Ocurrió un error inesperado al autenticar.';
}
