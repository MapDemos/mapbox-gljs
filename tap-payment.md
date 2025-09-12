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
            <button class="text-gray-600 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="ml-1 font-medium">戻る</span>
            </button>
            <h1 class="text-lg font-semibold text-gray-800">SF(電子マネー)利用履歴</h1>
            <button class="text-gray-600 hover:text-gray-800">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10V7m0 0l6-3m0 0l6 3m-6-3v10" />
                </svg>
            </button>
        </header>
        <!-- Transaction List will be generated here -->
        <main id="transaction-list" class="divide-y divide-gray-200">
            <!-- Dynamic content goes here -->
        </main>
    </div>
    <script>
        {% include {{ page.js }} %}
    </script>
</body>
</html>