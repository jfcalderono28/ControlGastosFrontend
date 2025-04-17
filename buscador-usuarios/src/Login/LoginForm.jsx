 import '../CSS/LoginForm.css'
 import { useNavigate } from 'react-router-dom';


import { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.access;
        localStorage.setItem('token', token);
        localStorage.setItem('refresh', data.refresh); // <-- AÑADIDO
      
        // Obtener info del usuario
        const userResponse = await fetch('http://localhost:8000/api/user/info/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      
        const userInfo = await userResponse.json();
      
        if (userResponse.ok) {
          localStorage.setItem('user_id', userInfo.id);
          localStorage.setItem('user_name', userInfo.name);
          localStorage.setItem('user_photo', userInfo.photo);
          localStorage.setItem('is_staff', userInfo.is_staff);
          localStorage.setItem('is_superuser', userInfo.is_superuser);
      
          onLogin(userInfo);
          navigate('/');
        } else {
          throw new Error('No se pudo obtener la información del usuario');
        }
      } else {
        throw new Error(data.detail || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      px={2}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 450,
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 4
          }}
        >
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              style: { borderRadius: 10 }
            }}
          />

          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              style: { borderRadius: 10 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              mt: 1
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Ingresar'
            )}
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes cuenta?{' '}
            <Button 
              color="primary" 
              size="small"
              sx={{ textTransform: 'none' }}
              // onClick={/* función para redirigir a registro */}
            >
              Regístrate aquí
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginForm;