// Mostrar/ocultar contraseña
const toggleLoginPassword = document.querySelector('#toggleLoginPassword');
const loginPassword = document.querySelector('#loginPassword');

if (toggleLoginPassword && loginPassword) {
  toggleLoginPassword.addEventListener('click', () => {
    const type = loginPassword.type === 'password' ? 'text' : 'password';
    loginPassword.type = type;
    toggleLoginPassword.classList.toggle('fa-eye-slash');
  });
}

// Cambiar estilo cuando el input tiene el foco
const inputs = document.querySelectorAll('.input-group input');

inputs.forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('active');
  });
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('active');
  });
});