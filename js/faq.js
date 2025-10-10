/*
 * Arquivo: js/faq.js
 * Finalidade: Pequeno script para funcionalidade de FAQ (accordion e filtros de categoria).
 * Versão: 1.0.0
 * Data: 2025-10-09
 */
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion functionality (guarded)
    const questions = document.querySelectorAll('.faq-question');
    // **CHECK JÁ EXISTENTE**: Garante que há perguntas antes de adicionar listeners
    if (questions && questions.length) {
        questions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                if (!answer) return; // Checagem interna

                // Toggle answer visibility
                answer.classList.toggle('active');

                // Toggle icon rotation (guard icon)
                if (icon) {
                    icon.style.transform = answer.classList.contains('active')
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)';
                }
            });
        });
    }

    // Category filtering (guarded)
    const categoryButtons = document.querySelectorAll('.category-button');
    // **CHECK JÁ EXISTENTE**: Garante que há botões antes de adicionar listeners
    if (categoryButtons && categoryButtons.length) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Placeholder: filter the FAQ items based on the selected category
            });
        });
    }
});