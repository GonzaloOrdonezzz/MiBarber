import { supabase } from './supabase';

export const authService = {
  // 1. Obtener la sesión actual guardada
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener sesión:', error);
      throw error;
    }
    return data.session;
  },

  // 2. Obtener el usuario actual
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
    return data.user;
  },

  // 3. Iniciar sesión con email y contraseña
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
    return data;
  },

  // 4. Registro de nuevo usuario (Barbero)
  async signUp(email, password, nombre = '') {
    const trimmedEmail = email.trim();
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
    return data;
  },

  // 5. Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      throw new Error(translateAuthError(error.message));
    }
  },

  // 6. Suscripción a cambios de estado de autenticación (login, logout, refresh)
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
    return 'Ya existe una cuenta con este correo electrónico.';
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
  if (msg.includes('failed to fetch')) {
    return 'Error de conexión al servidor (Failed to fetch). Comprueba si alguna extensión, antivirus o red bloquea supabase.co.';
  }
  return message || 'Ocurrió un error inesperado al autenticar.';
}
