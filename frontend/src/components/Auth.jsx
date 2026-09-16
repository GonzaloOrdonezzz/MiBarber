import React, { useState } from 'react';
import { 
  Scissors, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/auth';

export default function Auth({ onLoginSuccess, theme, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rawError, setRawError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setRawError('');
    setSuccessMsg('');

    // Validaciones básicas
    if (!email || !password) {
      setErrorMsg('Por favor completá todos los campos obligatorios.');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar Sesión
        const { session } = await authService.signIn(email, password);
        if (session && onLoginSuccess) {
          onLoginSuccess(session);
        }
      } else {
        // Registro
        const data = await authService.signUp(email, password, nombre);
        if (data?.session) {
          // Si Supabase tiene auto-confirmación habilitada, ya tenemos sesión:
          setSuccessMsg('¡Cuenta creada con éxito! Iniciando sesión...');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess(data.session);
          }, 800);
        } else if (data?.user) {
          // Si Supabase requiere confirmar por email:
          setSuccessMsg('¡Cuenta creada con éxito! Si tu proyecto requiere confirmación por correo, revisá tu casilla de email para confirmar tu cuenta y luego iniciá sesión.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      console.error('Error detallado de autenticación:', err);
      setErrorMsg(err.message || 'Ocurrió un error. Intenta nuevamente.');
      setRawError(String(err?.message || err || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Botón flotante para cambiar tema */}
      <div className="auth-theme-bar">
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          type="button"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Noche'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={17} color="var(--accent-color)" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon size={17} color="var(--accent-color)" />
              <span>Modo Noche</span>
            </>
          )}
        </button>
      </div>

      <div className="auth-card">
        {/* Encabezado con Logo */}
        <div className="auth-header">
          <div className="auth-brand-logo">
            <img 
              src="/logoMiBarber.png" 
              alt="MiBarber Logo" 
              className="auth-logo-img" 
              onError={(e) => { 
                e.target.style.display = 'none'; 
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; 
              }} 
            />
            <Scissors size={28} color="var(--accent-color)" style={{ display: 'none' }} />
          </div>
          <h1 className="auth-title">MiBarber</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Iniciá sesión para acceder a tu panel de cortes y finanzas' 
              : 'Creá tu cuenta de barbero y gestioná tus clientes y turnos'}
          </p>
        </div>

        {/* Pestañas de Cambio: Iniciar Sesión / Registrarse */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
              setRawError('');
              setSuccessMsg('');
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
              setRawError('');
              setSuccessMsg('');
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Notificaciones de Error o Éxito */}
        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={18} className="auth-alert-icon" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '100%' }}>
              <span>{errorMsg}</span>
              {rawError && (
                <code style={{ fontSize: '0.74rem', opacity: 0.85, wordBreak: 'break-all', marginTop: '4px', background: 'rgba(0,0,0,0.08)', padding: '3px 6px', borderRadius: '4px' }}>
                  {rawError}
                </code>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} className="auth-alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Acceso Rápido para Gonzalo */}
        {isLogin && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              marginBottom: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: '1px solid var(--accent-color)',
              color: 'var(--text-color)'
            }}
            onClick={async () => {
              try {
                setLoading(true);
                const { session } = await authService.signIn('ordonezgonzalo86@gmail.com', 'Gonza2014');
                if (session && onLoginSuccess) onLoginSuccess(session);
              } catch (err) {
                setErrorMsg(err.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Scissors size={17} color="var(--accent-color)" />
            <span>💈 Ingresar como Gonzalo (ordonezgonzalo86)</span>
          </button>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Tu Nombre o Barbería (Opcional)</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  className="form-input auth-input"
                  placeholder="Ej: Gonzalo / Barbería Deluxe"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                required
                className="form-input auth-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input auth-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña *</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input auth-input"
                  placeholder="Repetí la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner-text">Procesando...</span>
            ) : (
              <>
                <span>{isLogin ? 'Ingresar a mi Barbería' : 'Registrar mi Cuenta'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer con información de privacidad */}
        <div className="auth-footer">
          <p className="auth-toggle-link">
            {isLogin ? (
              <>
                ¿No tenés una cuenta todavía?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  Registrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés una cuenta creada?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  Iniciá sesión aquí
                </button>
              </>
            )}
          </p>

          <div className="auth-privacy-badge">
            <Sparkles size={14} color="var(--accent-color)" />
            <span>Tus turnos, ingresos y estadísticas son 100% privados e independientes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
