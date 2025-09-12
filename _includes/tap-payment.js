document.addEventListener('DOMContentLoaded', () => {
    const transactions = [
        { date: '07/07', merchant: '服の松本', amount: 7980, icon: 'fas fa-tshirt', color: 'bg-orange-400' },
        { date: '07/06', merchant: 'スーパーあおき', amount: 9700, icon: 'fas fa-shopping-cart', color: 'bg-emerald-500' },
        { date: '07/05', merchant: 'サフェひかり', amount: 9200, icon: 'fas fa-store', color: 'bg-blue-500' },
        { date: '07/04', merchant: 'スーパーあおき', amount: 9200, icon: 'fas fa-cut', color: 'bg-pink-400' },
        { date: '07/03', merchant: '服の松本', amount: 7980, icon: 'fas fa-tshirt', color: 'bg-orange-400' },
        { date: '07/02', merchant: 'スーパーあおき', amount: 9700, icon: 'fas fa-shopping-cart', color: 'bg-emerald-500' },
        { date: '07/01', merchant: 'デパート丸子', amount: 9300, icon: 'fas fa-info', color: 'bg-blue-400' },
        { date: '06/30', merchant: '服の松本', amount: 7980, icon: 'fas fa-tshirt', color: 'bg-orange-400' },
        { date: '06/29', merchant: 'スーパーあおき', amount: 9700, icon: 'fas fa-shopping-cart', color: 'bg-emerald-500' },
        { date: '06/28', merchant: 'デパート丸子', amount: 8300, icon: 'fas fa-tag', color: 'bg-orange-400' },
        { date: '06/27', merchant: '薬局たけだ', amount: 5400, icon: 'fas fa-pills', color: 'bg-red-400' },
        { date: '06/26', merchant: '家電のヤマダ', amount: 10300, icon: 'fas fa-desktop', color: 'bg-teal-500' },
        { date: '06/25', merchant: 'コンビニ大黒', amount: 12900, icon: 'fas fa-store', color: 'bg-blue-500' },
        { date: '06/24', merchant: 'コンビニ大黒', amount: 3600, icon: 'fas fa-store', color: 'bg-blue-500' },
        { date: '06/23', merchant: 'レストラン佐藤', amount: 9500, icon: 'fas fa-utensils', color: 'bg-green-500' },
        { date: '06/23', merchant: 'レストラン加藤', amount: 1000, icon: 'fas fa-pause', color: 'bg-indigo-500' }
    ];

    const transactionListContainer = document.getElementById('transaction-list');

    function renderTransactions() {
        let html = '';
        transactions.forEach(transaction => {
            html += `
                <div class="p-4 flex items-center">
                    <div class="text-sm text-gray-500 mr-4">${transaction.date}</div>
                    <div class="w-10 h-10 ${transaction.color} rounded-lg flex items-center justify-center mr-4">
                        <i class="${transaction.icon} text-white"></i>
                    </div>
                    <div class="flex-grow">
                        <div class="text-gray-800">${transaction.merchant}</div>
                    </div>
                    <div class="text-gray-800 font-semibold">¥${transaction.amount.toLocaleString()}</div>
                </div>
            `;
        });
        transactionListContainer.innerHTML = html;
    }

    renderTransactions();
});