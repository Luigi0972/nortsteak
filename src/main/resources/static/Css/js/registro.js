const togglePassword = document.querySelector('#togglePassword');
const password1 = document.querySelector('#password1');
const password2 = document.querySelector('#password2');
const message = document.querySelector('#message');

if (togglePassword && password1) {
  togglePassword.addEventListener('click', () => {
    const type = password1.type === 'password' ? 'text' : 'password';
    password1.type = type;
    togglePassword.classList.toggle('fa-eye-slash');
  });
}

if (password1 && password2 && message) {
  password2.addEventListener('input', () => {
    if (password1.value === password2.value) {
      message.textContent = "Las contraseñas coinciden";
      message.style.color = "green";
    } else {
      message.textContent = "Las contraseñas no coinciden";
      message.style.color = "red";
    }
  });
}