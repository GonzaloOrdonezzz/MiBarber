import { supabase } from './supabase';

const GONZALO_EMAIL = 'ordonezgonzalo86@gmail.com';
const GONZALO_PASS = 'Gonza2014';

export const authService = {
  // 1. Obtener la sesión real de Supabase
  async getSession() {
    // Limpiar cualquier token simulado viejo que haya quedado en localStorage
    try {
      const oldSession = localStorage.getItem('mibarber-user-session');
      if (oldSession && oldSession.includes('session-gonzalo')) {
        localStorage.removeItem('mibarber-user-session');
      }
    } catch (e) {}

    // A) Verificar si Supabase ya tiene la sesión real guardada
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        return data.session;
      }
    } catch (e) {
      console.warn('Error getSession Supabase:', e);
    }

    // B) Si no hay sesión activa y no se cerró sesión explícitamente,
    // iniciar sesión real con Supabase para obtener el JWT auténtico:
    const hasLoggedOut = localStorage.getItem('mibarber-logged-out');
    if (!hasLoggedOut) {
      try {
        console.log('Iniciando sesión real en Supabase para Gonzalo...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: GONZALO_EMAIL,
          password: GONZALO_PASS
        });

        if (!error && data?.session) {
          console.log('Sesión real de Supabase obtenida con éxito!');
          return data.session;
        }
      } catch (err) {
        console.error('Error auto-signin Supabase:', err);
      }
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password
    });

    if (error) {
      throw new Error(translateAuthError(error.message));
    }

    localStorage.removeItem('mibarber-logged-out');
    return data;
  },

  // 4. Registro de nuevo usuario (Barbero)
  async signUp(email, password, nombre = '') {
    const trimmedEmail = email.trim();
    // Si es el usuario de Gonzalo, hacer login directo
    if (trimmedEmail.toLowerCase() === GONZALO_EMAIL.toLowerCase()) {
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
