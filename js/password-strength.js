// Regras para verificação de senha
const passwordRules = {
    minLength: { test: (pwd) => pwd.length >= 8, message: 'Mínimo 8 caracteres' },
    hasUppercase: { test: (pwd) => /[A-Z]/.test(pwd), message: 'Uma letra maiúscula' },
    hasLowercase: { test: (pwd) => /[a-z]/.test(pwd), message: 'Uma letra minúscula' },
    hasNumber: { test: (pwd) => /\d/.test(pwd), message: 'Um número' },
    hasSpecial: { test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: 'Um caractere especial' }
};

function updatePasswordStrength(password) {
    const strengthMeter = document.getElementById('strength-meter');
    const strengthText = document.getElementById('strength-text');
    const rulesList = document.getElementById('password-rules');
    
    // Atualiza a lista de regras
    Object.entries(passwordRules).forEach(([rule, { test, message }]) => {
        const ruleElement = document.querySelector(`[data-rule="${rule}"]`);
        const passed = test(password);
        ruleElement.classList.toggle('passed', passed);
        ruleElement.classList.toggle('failed', !passed);
        ruleElement.querySelector('i').className = passed ? 'fas fa-check' : 'fas fa-times';
    });

    // Calcula a força da senha
    const passedRules = Object.values(passwordRules).filter(rule => rule.test(password)).length;
    const strength = (passedRules / Object.keys(passwordRules).length) * 100;

    // Atualiza o medidor e texto
    let strengthLevel = '';
    let color = '';
    
    if (strength === 100) {
        strengthLevel = 'forte';
        color = 'var(--success-color)';
    } else if (strength >= 60) {
        strengthLevel = 'média';
        color = 'var(--warning-color)';
    } else if (strength > 0) {
        strengthLevel = 'fraca';
        color = 'var(--danger-color)';
    } else {
        strengthLevel = 'muito fraca';
        color = 'var(--muted)';
    }

    strengthMeter.style.width = `${strength}%`;
    strengthMeter.style.backgroundColor = color;
    strengthText.textContent = `Senha ${strengthLevel}`;
    strengthText.style.color = color;
}

// Setup dos event listeners
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const rulesPopup = document.getElementById('password-rules-popup');
    
    // Mostra o popup de regras quando o input de senha recebe foco
    passwordInput.addEventListener('focus', () => {
        rulesPopup.classList.add('show');
    });

    // Esconde o popup quando clica fora
    document.addEventListener('click', (e) => {
        if (!passwordInput.contains(e.target) && !rulesPopup.contains(e.target)) {
            rulesPopup.classList.remove('show');
        }
    });

    // Mantém o popup visível quando clica nele
    rulesPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Atualiza a força da senha em tempo real
    passwordInput.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    // Verifica se as senhas coincidem
    confirmInput.addEventListener('input', () => {
        const passwordMatch = passwordInput.value === confirmInput.value;
        confirmInput.classList.toggle('match', passwordMatch);
        confirmInput.classList.toggle('mismatch', !passwordMatch && confirmInput.value);
    });

    // Toggle de visibilidade da senha
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            button.querySelector('i').className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
        });
    });
});