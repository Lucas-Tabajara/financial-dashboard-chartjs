/**
 * Elementos do DOM
 */
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');

/** * Estado da aplicação: Recupera dados do LocalStorage ou inicia vazio 
 */
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

/**
 * Gera um ID único baseado no timestamp atual
 * @returns {number} ID único
 */
const generateID = () => Math.floor(Math.random() * 100000000);

/**
 * Adiciona uma nova transação à lista e ao armazenamento
 * @param {Event} e - Evento de submissão do formulário
 */
function addTransaction(e) {
    e.preventDefault();

    const transactionName = text.value.trim();
    const transactionAmount = amount.value.trim();

    if (transactionName === '' || transactionAmount === '') {
        alert('Por favor, preencha a descrição e o valor da transação.');
        return;
    }

    const transaction = {
        id: generateID(),
        text: transactionName,
        amount: parseFloat(transactionAmount),
        category: categorySelect.value
    };

    transactions.push(transaction);
    
    init(); // Reinicializa a interface com os novos dados
    updateLocalStorage();

    // Limpa os campos
    text.value = '';
    amount.value = '';
}

/**
 * Renderiza uma única transação no DOM
 * @param {Object} transaction - Objeto da transação
 */
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        ${transaction.text} <span>${sign} R$ ${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn" data-id="${transaction.id}">x</button>
    `;

    list.appendChild(item);
}

/**
 * Calcula e atualiza o saldo, receitas e despesas no cabeçalho
 */
function updateValues() {
    const amounts = transactions.map(t => t.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1)
        .toFixed(2);

    balance.innerText = `R$ ${total}`;
    money_plus.innerText = `+ R$ ${income}`;
    money_minus.innerText = `- R$ ${expense}`;
}

/**
 * Gerencia a remoção de transações usando delegação de eventos
 * @param {Event} e - Evento de clique
 */
function handleListClick(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        transactions = transactions.filter(t => t.id !== id);
        updateLocalStorage();
        init();
    }
}

/**
 * Atualiza o gráfico de despesas por categoria
 */
function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expenses = transactions.filter(t => t.amount < 0);
    
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (myChart) myChart.destroy();
    if (data.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#95a5a6'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Distribuição de Gastos' }
            }
        }
    });
}

/**
 * Sincroniza o estado atual com o LocalStorage
 */
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Função de inicialização para renderizar a interface
 */
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

// Event Listeners
form.addEventListener('submit', addTransaction);
list.addEventListener('click', handleListClick);

// Início da aplicação
init();