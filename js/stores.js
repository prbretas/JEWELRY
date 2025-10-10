/*
 * Arquivo: js/stores.js
 * Finalidade: Pequeno script para pagina de lojas (filtros e seleção de localização).
 * Versão: 1.0.1 (Filtro de Localização Implementado)
 * Data: 2025-10-09
 */
document.addEventListener('DOMContentLoaded', function() {
    /**
     * @function filterStores
     * @description Filtra as lojas com base na localização selecionada.
     * @param {string} location - A localização para filtrar ('all' para mostrar todos)
     */
    function filterStores(location) {
        const storeLocations = document.querySelectorAll('.store-location'); // Assumindo esta classe para cada loja
        storeLocations.forEach(store => {
            const storeLocation = store.dataset.location || 'all'; // Padrão 'all'
            // Se a localização for 'all' OU a localização da loja corresponder, mostra.
            if (location === 'all' || storeLocation === location) {
                store.style.display = ''; // Mostra o item
            } else {
                store.style.display = 'none'; // Esconde o item
            }
        });
    }

    // Store filter functionality (guarded)
    const filterButtons = document.querySelectorAll('.filter-button');
    if (!filterButtons || filterButtons.length === 0) return;
    
    // Inicializa o filtro para a categoria 'all' se o botão existir
    const allButton = document.querySelector('.filter-button[data-location="all"]');
    if (allButton) {
        allButton.classList.add('active');
        filterStores('all');
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const location = button.dataset.location; // Pega o valor de data-location
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // AÇÃO: Filtra as lojas
            if (location) {
                filterStores(location);
            }
        });
    });
});