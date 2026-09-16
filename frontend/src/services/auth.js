// ============================================================
// MiBarber - Sistema de Cuentas y Autenticación Resiliente
// ============================================================

// Cuenta principal de Gonzalo (con su UID oficial de Supabase)
const DEFAULT_ACCOUNTS = [
  {
    id: 'efb95d5d-072f-4644-bb3a-9d1f086cd6af',
    email: 'ordonezgonzalo86@gmail.com',
    password: 'Gonza2014',
    nombre: 'Gonzalo'
  }
];

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem('mibarber_registered_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Asegurar que la cuenta de Gonzalo siempre esté presente y con su ID correcto
      if (!parsed.some(a => a.email.toLowerCase() === DEFAULT_ACCOUNTS[0].email.toLowerCase())) {
        parsed.unshift(DEFAULT_ACCOUNTS[0]);
      }
      return parsed;
    }
  } catch (e) {}
  return [...DEFAULT_ACCOUNTS];
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem('mibarber_registered_accounts', JSON.stringify(accounts));
  } catch (e) {}
}

export const authService = {
  // 1. Obtener la sesión activa actual
  async getSession() {
    try {
      const active = localStorage.getItem('mibarber_active_user');
      if (active) {
        const user = JSON.parse(active);
        if (user && user.id) {
          return { user, access_token: `token_${user.id}` };
        }
      }
    } catch (e) {}

    // Si es la primera vez o no cerró sesión explícitamente, iniciar por defecto con la cuenta de Gonzalo
    const hasLoggedOut = localStorage.getItem('mibarber-logged-out');
    if (!hasLoggedOut) {
      const gonzalo = DEFAULT_ACCOUNTS[0];
      const user = {
        id: gonzalo.id,
        email: gonzalo.email,
        nombre: gonzalo.nombre,
        user_metadata: { nombre: gonzalo.nombre }
      };
      localStorage.setItem('mibarber_active_user', JSON.stringify(user));
      return { user, access_token: `token_${user.id}` };
    }

    return null;
  },

  // 2. Obtener el ID del usuario activo (usado por api.js para filtrar cortes)
  getCurrentUserId() {
    try {
      const active = localStorage.getItem('mibarber_active_user');
      if (active) {
        const user = JSON.parse(active);
        if (user?.id) return user.id;
      }
    } catch (e) {}
    return 'efb95d5d-072f-4644-bb3a-9d1f086cd6af';
  },

  // 3. Obtener el usuario actual
  async getUser() {
    const sess = await this.getSession();
    return sess?.user || null;
  },

  // 4. Iniciar sesión con email y contraseña
  async signIn(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const accounts = getStoredAccounts();

    const found = accounts.find(
      (a) => a.email.toLowerCase() === trimmedEmail && a.password === password
    );

    if (!found) {
      throw new Error('Correo electrónico o contraseña incorrectos.');
    }

    const user = {
      id: found.id,
      email: found.email,
      nombre: found.nombre || found.email.split('@')[0],
      user_metadata: { nombre: found.nombre || found.email.split('@')[0] }
    };

    localStorage.removeItem('mibarber-logged-out');
    localStorage.setItem('mibarber_active_user', JSON.stringify(user));

    const session = { user, access_token: `token_${user.id}` };
    return { user, session };
  },

  // 5. Registro de nueva cuenta para otro barbero
  async signUp(email, password, nombre = '') {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      throw new Error('Ya existe una cuenta con este correo electrónico. Por favor iniciá sesión.');
    }

    // Generar un ID único para el nuevo barbero
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newAccount = {
      id: newId,
      email: trimmedEmail,
      password,
      nombre: (nombre || '').trim() || trimmedEmail.split('@')[0]
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    const user = {
      id: newAccount.id,
      email: newAccount.email,
      nombre: newAccount.nombre,
      user_metadata: { nombre: newAccount.nombre }
    };

    localStorage.removeItem('mibarber-logged-out');
    localStorage.setItem('mibarber_active_user', JSON.stringify(user));

    const session = { user, access_token: `token_${user.id}` };
    return { user, session };
  },

  // 6. Cerrar sesión
  async signOut() {
    localStorage.setItem('mibarber-logged-out', 'true');
    localStorage.removeItem('mibarber_active_user');
  },

  // 7. Suscripción a cambios
  onAuthStateChange(callback) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};
