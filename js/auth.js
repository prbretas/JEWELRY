
/**
 * @file js/auth.js
 * @module AuthManager
 * @author Jewelry Team (prbretas)
 * @version 1.0.2
 * @date 2025-10-09
 * @description Gerenciamento de autenticação local (simulada) — login, registro, validação de formulário, toggles de senhas e integração social.
 *
 * Histórico de alterações:
 * - 1.0.2 (09/10/2025 14:00): Padronização de comentários e documentação JSDoc.
 * - 1.0.1: Atualizado com showToast e Promises.
 * - 1.0.0: Implementação inicial de login, registro e validação.
 */

/**
 * @class AuthManager
 * @description Gerencia a autenticação de usuários, incluindo login, registro,
 * validação de formulários e integrações sociais.
 *
 * (Note: Esta implementação usa Promises para simular chamadas de API)
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        // Tempo de simulação de API (para Promises)
        this.SIM_DELAY = 1000; 
    }

    /**
     * @method showError
     * @description Exibe mensagens de erro usando o sistema de notificação global.
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        // AJUSTE: Substituído alert() por showToast()
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        } else {
            console.error('Auth Error: ' + message);
        }
    }

    /**
     * @method validateCPF
     * @description Valida um número de CPF.
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} true se o CPF é válido, false caso contrário
     */
    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    /**
     * @method formatCPF
     * @description Formata um CPF com pontos e traço.
     * @param {string} cpf - CPF a ser formatado
     * @returns {string} CPF formatado
     */
    formatCPF(cpf) {
        return cpf
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    /**
     * @method formatPhone
     * @description Formata um número de telefone.
     * @param {string} phone - Telefone a ser formatado
     * @returns {string} Telefone formatado
     */
    formatPhone(phone) {
        return phone
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }

    /**
     * @method validatePassword
     * @description Valida uma senha conforme critérios de segurança.
     * @param {string} password - Senha a ser validada
     * @returns {boolean} true se a senha atende aos critérios
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    }

    /**
     * @method validateAge
     * @description Verifica se a pessoa tem pelo menos 18 anos.
     * @param {string} birthDate - Data de nascimento
     * @returns {boolean} true se tem 18 anos ou mais
     */
    validateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth() - birth.getMonth();
        
        if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    /**
     * @method login
     * @description Simula o login do usuário.
     * @async
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Promessa resolvida com dados do usuário ou rejeitada com erro
     */
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password) {
                    this.showError('Preencha email e senha.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }

                // Simulação de autenticação
                if (email === 'ph@joalheria.com' && password === '123456') {
                    this.currentUser = { email, name: 'PH' };
                    this.isAuthenticated = true;
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Bem-vindo, ${this.currentUser.name}!`, 'success');
                    }
                    return resolve(this.currentUser);
                } else {
                    this.showError('Credenciais inválidas.');
                    return reject({ message: 'Credenciais inválidas.' });
                }
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method register
     * @description Simula o registro de um novo usuário.
     * @async
     * @param {string} email - Email do novo usuário
     * @param {string} password - Senha do novo usuário
     * @returns {Promise<Object>} Promessa resolvida com dados do novo usuário
     */
    async register(email, password, name) {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password || !name) {
                    this.showError('Preencha todos os campos para registro.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }
                // Simulação de sucesso no registro
                const newUser = { email, name };
                if (typeof window.showToast === 'function') {
                    window.showToast('Registro realizado com sucesso! Faça login.', 'success');
                }
                return resolve(newUser);
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method updateProfile
     * @description Simula atualização do perfil do usuário.
     * @async
     * @param {Object} data - Dados do perfil (ex: { name, email })
     * @returns {Promise<Object>} Promessa resolvida com dados atualizados ou rejeitada com erro
     */
    async updateProfile(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    this.showError('Você precisa estar logado para atualizar o perfil.');
                    return reject({ message: 'Usuário não autenticado.' });
                }
                if (!data || (!data.name && !data.email)) {
                    this.showError('Informe os dados para atualizar o perfil.');
                    return reject({ message: 'Dados insuficientes.' });
                }
                // Atualiza apenas os campos fornecidos
                if (data.name) this.currentUser.name = data.name;
                if (data.email) this.currentUser.email = data.email;
                if (typeof window.showToast === 'function') {
                    window.showToast('Perfil atualizado com sucesso!', 'success');
                }
                return resolve(this.currentUser);
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method changePassword
     * @description Simula alteração de senha do usuário.
     * @async
     * @param {string} oldPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<string>} Promessa resolvida com mensagem de sucesso ou rejeitada com erro
     */
    async changePassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    this.showError('Você precisa estar logado para alterar a senha.');
                    return reject({ message: 'Usuário não autenticado.' });
                }
                if (!oldPassword || !newPassword) {
                    this.showError('Preencha todos os campos de senha.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }
                if (oldPassword === newPassword) {
                    this.showError('A nova senha deve ser diferente da atual.');
                    return reject({ message: 'Nova senha igual à atual.' });
                }
                // Simula sucesso
                if (typeof window.showToast === 'function') {
                    window.showToast('Senha alterada com sucesso!', 'success');
                }
                return resolve('Senha alterada com sucesso!');
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method resetPassword
     * @description Simula reset de senha via email.
     * @async
     * @param {string} email - Email do usuário
     * @returns {Promise<string>} Promessa resolvida com mensagem de sucesso ou rejeitada com erro
     */
    async resetPassword(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email) {
                    this.showError('Informe o e-mail para redefinir a senha.');
                    return reject({ message: 'E-mail não informado.' });
                }
                // Simula envio de email
                if (typeof window.showToast === 'function') {
                    window.showToast('Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.', 'info');
                }
                return resolve('Instruções de redefinição enviadas.');
            }, this.SIM_DELAY);
        });
    }

}

// Initialize authentication
const auth = new AuthManager();

// Expose to global for pages that include this file as a plain <script>
if (typeof window !== 'undefined') {
    window.auth = auth;
}

// Event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do formulário multi-etapas
    const form = document.getElementById('registerForm');
    const steps = document.querySelectorAll('.step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-line');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitButton');
    let currentStep = 1;

    function showStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
            if (step.dataset.step == stepNumber) {
                step.classList.add('active');
            }
        });

        // Atualiza os indicadores de progresso
        progressSteps.forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Atualiza a linha de progresso
        if (stepNumber > 1) {
            progressLine.classList.add('completed');
        } else {
            progressLine.classList.remove('completed');
        }

        // Atualiza os botões
        prevButton.style.display = stepNumber > 1 ? 'block' : 'none';
        nextButton.style.display = stepNumber < steps.length ? 'block' : 'none';
        submitButton.style.display = stepNumber === steps.length ? 'block' : 'none';
    }

    function validateFields(stepNumber) {
        const currentStepElement = document.querySelector(`.step[data-step="${stepNumber}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]');
        const emptyFields = [];
        let isValid = true;

        inputs.forEach(input => {
            // Remove classes de erro anteriores
            input.classList.remove('error');
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }

            // Validação de campos vazios
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                
                // Adiciona mensagem de erro específica
                const message = document.createElement('div');
                message.className = 'error-message';
                message.textContent = `Campo ${input.placeholder || input.name} é obrigatório`;
                input.parentElement.appendChild(message);
                
                // Adiciona o nome do campo à lista de campos vazios
                emptyFields.push(input.placeholder || input.name);
                return;
            }

            // Validações específicas
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('error');
                    const message = document.createElement('div');
                    message.className = 'error-message';
                    message.textContent = 'Email inválido';
                    input.parentElement.appendChild(message);
                }
            }

            if (input.id === 'cpf') {
                if (!auth.validateCPF(input.value)) {
                    isValid = false;
                    input.classList.add('error');
                    const message = document.createElement('div');
                    message.className = 'error-message';
                    message.textContent = 'CPF inválido';
                    input.parentElement.appendChild(message);
                }
            }

            if (input.id === 'phone') {
                const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('error');
                    const message = document.createElement('div');
                    message.className = 'error-message';
                    message.textContent = 'Telefone inválido';
                    input.parentElement.appendChild(message);
                }
            }

            if (input.id === 'birthdate' && input.value) {
                if (!auth.validateAge(input.value)) {
                    isValid = false;
                    showFieldError(input, 'Você deve ter pelo menos 18 anos para se cadastrar');
                }
            }
        });

        if (!isValid && emptyFields.length > 0) {
            window.showToast(`Por favor, preencha os seguintes campos: ${emptyFields.join(', ')}`, 'warning');
            const firstError = currentStepElement.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
        }

        return isValid;
    }

    // Event listeners para navegação entre etapas
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (validateFields(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    }

    // Inicialização do formulário multi-etapas
    if (form) {
        showStep(currentStep);
    }

    // Elementos de login
    const loginForm = document.getElementById('loginForm');
    const loginPasswordInput = loginForm?.querySelector('input[type="password"]');
    const loginTogglePasswordBtn = loginForm?.querySelector('.toggle-password');

    // Elementos de registro
    const registerForm = document.getElementById('registerForm');
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Formatação de inputs
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = auth.formatCPF(e.target.value);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = auth.formatPhone(e.target.value);
        });
    }

    // Toggle de senha
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            btn.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
        });
    });

    // Validação do formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;

            // Reset previous validations
            registerForm.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                group.querySelector('.validation-message')?.remove();
            });

            const formData = new FormData(registerForm);
            const submitButton = registerForm.querySelector('button[type="submit"]');
            
            try {
                // Validação de idade
                const birthDate = formData.get('birthDate');
                if (!auth.validateAge(birthDate)) {
                    throw new Error('Você precisa ter pelo menos 18 anos para se cadastrar.');
                }

                // Validação de CPF
                const cpf = formData.get('cpf');
                if (!auth.validateCPF(cpf)) {
                    throw new Error('CPF inválido.');
                }

                // Validação de senha
                const password = formData.get('password');
                if (!auth.validatePassword(password)) {
                    throw new Error('A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
                }

                // Validação de confirmação de senha
                if (password !== formData.get('confirmPassword')) {
                    throw new Error('As senhas não coincidem.');
                }

                // Desabilita o botão e mostra loading
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

                // Registra o usuário
                const name = formData.get('fullName');
                const email = formData.get('email');
                await auth.register(email, password, name);

                // Redireciona para a página de login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                auth.showError(error.message || 'Erro ao realizar cadastro.');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
            }
        });
    }

    // Manipulador do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            try {
                // Desabilita o botão e mostra loading
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');

                await auth.login(email, password);

                // Redireciona para a página inicial
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);

            } catch (error) {
                auth.showError('Erro ao realizar login. Verifique suas credenciais.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }
});

// Inicialização do formulário multi-etapas quando o documento estiver carregado
function initializeFormSteps() {
    // Elementos do formulário multi-etapas
    const form = document.getElementById('registerForm');
    const steps = document.querySelectorAll('.step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-line');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitButton');
    const birthdateInput = document.getElementById('birthdate');
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('phone');
    let currentStep = 1;

    // Inicializa os campos de data
    if (birthdateInput) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 18);
        birthdateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    }

    // Função para mostrar a etapa atual
    function showStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
            if (step.dataset.step == stepNumber) {
                step.classList.add('active');
            }
        });

        // Atualiza os indicadores de progresso
        progressSteps.forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Atualiza a linha de progresso
        if (stepNumber > 1) {
            progressLine.classList.add('completed');
        } else {
            progressLine.classList.remove('completed');
        }

        // Atualiza os botões
        prevButton.style.display = stepNumber > 1 ? 'block' : 'none';
        nextButton.style.display = stepNumber < steps.length ? 'block' : 'none';
        submitButton.style.display = stepNumber === steps.length ? 'block' : 'none';
    }

    // Função de validação dos campos
    function validateFields(stepNumber) {
        const currentStepElement = document.querySelector(`.step[data-step="${stepNumber}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]');
        const emptyFields = [];
        let isValid = true;

        // Validate birthdate first if it exists in current step
        const birthdateInput = currentStepElement.querySelector('#birthdate');
        if (birthdateInput && birthdateInput.value) {
            if (!auth.validateAge(birthdateInput.value)) {
                isValid = false;
                showFieldError(birthdateInput, 'Você deve ter pelo menos 18 anos para se cadastrar');
                window.showToast('Você deve ter pelo menos 18 anos para se cadastrar', 'error');
                return false;
            }
        }

        inputs.forEach(input => {
            // Remove classes de erro anteriores
            input.classList.remove('error');
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }

            // Validação de campos vazios
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                
                // Adiciona mensagem de erro específica
                const message = document.createElement('div');
                message.className = 'error-message';
                message.textContent = `Campo ${input.placeholder || input.name} é obrigatório`;
                input.parentElement.appendChild(message);
                
                emptyFields.push(input.placeholder || input.name);
                return;
            }

            // Validações específicas por tipo de campo
            switch(input.id) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        showFieldError(input, 'Email inválido');
                    }
                    break;

                case 'birthdate':
                    if (!auth.validateAge(input.value)) {
                        isValid = false;
                        showFieldError(input, 'Você deve ter pelo menos 18 anos para se cadastrar');
                    }
                    break;

                case 'cpf':
                    if (!auth.validateCPF(input.value)) {
                        isValid = false;
                        showFieldError(input, 'CPF inválido');
                    }
                    break;

                case 'phone':
                    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
                    if (!phoneRegex.test(input.value)) {
                        isValid = false;
                        showFieldError(input, 'Telefone inválido');
                    }
                    break;
            }
        });

        if (!isValid) {
            if (emptyFields.length > 0) {
                window.showToast(`Por favor, preencha os seguintes campos: ${emptyFields.join(', ')}`, 'warning');
            }
            const firstError = currentStepElement.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
        }

        return isValid;
    }

    function showFieldError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    // Event listeners para máscaras de input
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = auth.formatCPF(e.target.value);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = auth.formatPhone(e.target.value);
        });
    }

    if (birthdateInput) {
        // Função para validar a data de nascimento
        const validateBirthdate = () => {
            if (!birthdateInput.value) return;

            if (!auth.validateAge(birthdateInput.value)) {
                showFieldError(birthdateInput, 'Você deve ter pelo menos 18 anos para se cadastrar');
                return false;
            } else {
                birthdateInput.classList.remove('error');
                const errorMessage = birthdateInput.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
                return true;
            }
        };

        // Validar quando o campo perde o foco
        birthdateInput.addEventListener('blur', validateBirthdate);
        
        // Validar enquanto digita (opcional, para feedback em tempo real)
        birthdateInput.addEventListener('input', () => {
            // Limpa erro anterior ao começar a digitar
            birthdateInput.classList.remove('error');
            const errorMessage = birthdateInput.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
        
        // Define a data máxima permitida (18 anos atrás)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 18);
        birthdateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    }

    // Event listeners para navegação
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
            
            // Validate birthdate specifically if it's in the current step
            const birthdateInput = currentStepElement.querySelector('#birthDate');
            if (birthdateInput) {
                if (!birthdateInput.value) {
                    showFieldError(birthdateInput, 'Data de nascimento é obrigatória');
                    window.showToast('Por favor, informe sua data de nascimento', 'error');
                    birthdateInput.focus();
                    return;
                }
                if (!auth.validateAge(birthdateInput.value)) {
                    showFieldError(birthdateInput, 'Você deve ter pelo menos 18 anos para se cadastrar');
                    window.showToast('Você deve ter pelo menos 18 anos para se cadastrar', 'error');
                    birthdateInput.focus();
                    return;
                }
            }

            // Validate all required fields
            if (validateFields(currentStep)) {
                // If all validations pass, move to next step
                currentStep++;
                showStep(currentStep);
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    }

    // Manipulação do formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateFields(currentStep)) {
                window.showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

            try {
                const formData = new FormData(form);
                await auth.register(formData.get('email'), formData.get('password'), formData.get('fullName'));
                
                window.showToast('Cadastro realizado com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } catch (error) {
                window.showToast('Erro ao processar cadastro. Tente novamente.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
            }
        });
    }

    // Função para mostrar erros nos campos
    function showFieldError(input, message) {
        input.classList.add('error');
        // Remove any existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
        input.focus();
    }

    // Inicialização
    showStep(currentStep);
}

// Inicializa o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeFormSteps);
    