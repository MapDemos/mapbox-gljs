---
layout: null
title: Tap Payment
js: tap-payment.js
---

<html lang="ja">
<head>
    <meta charset="UTF-8">
    {% include common_head.html %}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>利用履歴</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden my-4">
        <!-- Header -->
        <header class="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <button id="back-button" class="text-gray-600 hover:text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="ml-1 font-medium">戻る</span>
            </button>
            <h1 class="text-lg font-semibold text-gray-800">SF(電子マネー)利用履歴</h1>
            <button id="map-toggle-button" class="text-gray-600 hover:text-gray-800">
                 <i class="fa-regular fa-map text-2xl"></i>
            </button>
        </header>

        <!-- Transaction List -->
        <main id="transaction-list" class="divide-y divide-gray-200">
            <!-- Dynamic content goes here -->
        </main>

        <!-- Transaction Details View (hidden by default) -->
        <div id="details-view" style="display: none;">
            <div class="bg-slate-500 text-white p-6 text-center">
                <h2 id="details-shop-name" class="text-xl font-semibold"></h2>
            </div>
            <div class="text-center p-8">
                <p class="text-gray-500 text-sm">支払い額</p>
                <p id="details-amount" class="text-5xl font-bold text-gray-800">¥0</p>
            </div>
            <div class="px-6 pb-6">
                <div class="border-t border-gray-200 pt-4">
                   <div class="flex justify-between text-gray-700">
                        <span>決済日時</span>
                        <span id="details-datetime"></span>
                    </div>
                    <div class="flex justify-between text-gray-700">
                        <span>購入小計</span>
                        <span id="details-subtotal">¥0</span>
                    </div>
                    <div class="flex justify-between text-gray-700 mt-1">
                        <span>消費税 (10%)</span>
                        <span id="details-tax">¥0</span>
                    </div>
                    <div class="flex justify-between text-gray-900 font-bold mt-2 pt-2 border-t">
                        <span>合計</span>
                        <span id="details-total">¥0</span>
                    </div>
                </div>
            </div>
            <!-- Static Map Image Container -->
            <div id="details-map-container" class="w-full h-48">
                <img id="details-map-image" src="" alt="Transaction Location Map" class="w-full h-full object-cover">
            </div>
        </div>

        <!-- Map Container (hidden by default) -->
        <div id="map-container" class="relative w-full h-[75vh]" style="display: none;">
            <!-- Horizontally Scrolling Details Panel -->
            <div id="map-details-panel" class="absolute bottom-0 left-0 right-0 bg-transparent z-20 p-4" style="display: none;">
                <button id="panel-close-button" class="absolute top-1 right-4 text-gray-600 hover:text-gray-900 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div id="horizontal-scroll-container" class="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
                    <!-- Individual panels will be injected here by JS -->
                </div>
            </div>
        </div>

    </div>

    <!-- Hidden Tailwind CSS Palette to force JIT compilation -->
    <div class="hidden">
        <span class="bg-orange-400"></span>
        <span class="bg-pink-400"></span>
        <span class="bg-red-400"></span>
        <span class="bg-blue-400"></span>
        <span class="bg-purple-400"></span>
        <span class="bg-green-400"></span>
    </div>
    <script>
        {% include shop-details.js %}
        {% include {{ page.js }} %}
    </script>
</body>
</html>