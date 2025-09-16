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

        <!-- Map Container (hidden by default) -->
        <div id="map-container" class="relative w-full h-[75vh]" style="display: none;">
            <!-- Details Panel (hidden by default) -->
            <div id="map-details-panel" class="absolute bottom-8 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20" style="display: none;">
                <button id="panel-close-button" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
                <div class="flex">
                    <div class="flex-grow">
                        <h3 id="panel-name" class="font-bold text-lg">Shop Name</h3>
                        <p id="panel-details" class="text-sm text-gray-600">Details about the shop</p>
                    </div>
                    <img id="panel-image" src="" alt="Shop Image" class="w-20 h-20 rounded-md object-cover ml-4">
                </div>
                <div class="flex justify-between mt-4">
                    <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full mr-2">ルート</button>
                    <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold w-full ml-2">詳細</button>
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