---
layout: null
title: Home
---
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <link href="https://fonts.googleapis.com/css2?family=Raleway&display=swap" rel="stylesheet">
  <style>
* {
  font-family: Raleway, sans-serif;
  text-align: center;
  color: #fff;
  text-shadow:
        /* Black border effect */
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000,
}
body {
  background-color: #000;
}
header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.header-icon {
    height: 32px;
    width: 32px;
    background-size: 32px 32px;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc5IiBoZWlnaHQ9IjE3OSIgdmlld0JveD0iMCAwIDE3OSAxNzkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik04OS4xIDAuODAwMDAzQzM5LjkgMC44MDAwMDMgMCA0MC43IDAgODkuOUMwIDEzOS4xIDM5LjkgMTc5IDg5LjEgMTc5QzEzOC4zIDE3OSAxNzguMiAxMzkuMSAxNzguMiA4OS45QzE3OC4yIDQwLjcgMTM4LjMgMC44MDAwMDMgODkuMSAwLjgwMDAwM1pNOTguMyAzNS40QzEwOS43IDM1LjcgMTIxLjIgNDAuMiAxMzAgNDkuMUMxNDcuNyA2Ni44IDE0OC4zIDk0LjggMTMxLjQgMTExLjhDMTAwLjkgMTQyLjMgNDYuNiAxMzIuNSA0Ni42IDEzMi41QzQ2LjYgMTMyLjUgMzYuOCA3OC4yIDY3LjMgNDcuN0M3NS44IDM5LjMgODcgMzUuMiA5OC4zIDM1LjRaTTk5LjMgNTNMOTAuNiA3MUw3Mi43IDc5LjdMOTAuNiA4OC40TDk5LjMgMTA2LjRMMTA4LjEgODguNEwxMjYgNzkuN0wxMDguMSA3MUw5OS4zIDUzWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==');
}
/* Wrapper for the iframe to ensure it's responsive and scaled */
.iframe-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border: 1px solid #ddd;
  background-color: #111;
  cursor: pointer;
}

/* Placeholder shown before iframe loads */
.iframe-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
  text-shadow: none;
  letter-spacing: 0.03em;
}

/* The iframe itself */
.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 400%;
  height: 400%;
  transform: scale(0.25);
  transform-origin: top left;
  pointer-events: none;
}

/* Open button overlay */
.open-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 5px 10px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  text-decoration: none;
  text-shadow: none;
  display: none;
  z-index: 10;
}

.open-btn:hover {
  background: rgba(0,0,0,0.9);
}

/* Container to hold multiple cards */
.card-container {
  display: flex;
  flex-wrap: wrap; /* Wrap cards onto new lines */
  gap: 20px; /* Space between cards */
  justify-content: flex-start; /* Distribute cards evenly */
}

/* Card styles */
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 300px; /* Card width */
  text-align: center;
  margin: 10px; /* Margin between cards */
}

/* Content section of the card */
.card-content {
  /*padding: 5px;*/
  background-color: #fff;
}

/* Title of the card */
.card-content h3 {
  font-size: 18px;
  margin: 10px 0;
  color: #000;
}

/* Button/link style */
.card-button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #007acc;
  color: #fff;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 10px;
}

.card-button:hover {
  background-color: #005fa3;
}

@media (max-width: 768px) {
  .card-container {
    justify-content: center; /* Center cards on smaller screens */
  }
}
</style>
</head>
<body>
  <header>
    <div class="header-icon"></div>
    <h1>{{ site.title }}</h1> 
  </header>
  <main>

<div class="card-container">
  {% for page in site.html_pages %}
    {% if page.url contains '.html' and page.url != '/404.html' %}
    {% unless page.url contains '/docs/' %}
      <div class="card">
        <div class="iframe-container" data-src="{{ page.url | relative_url }}">
          <div class="iframe-placeholder">Click to preview</div>
          <a class="open-btn" href="{{ page.url | relative_url }}" target="_blank">Open →</a>
        </div>
        <div class="card-content">
          <h3>{{ page.title | default: page.url }}</h3>
        </div>
      </div>
    {% endunless %}
    {% endif %}
  {% endfor %}

  {% for card in site.data.external %}
  <div class="card">
    <div class="iframe-container" data-src="{{ card.url }}">
      <div class="iframe-placeholder">Click to preview</div>
      <a class="open-btn" href="{{ card.url }}" target="_blank">Open →</a>
    </div>
    <div class="card-content">
      <h3>{{ card.title }}</h3>
    </div>
  </div>
  {% endfor %}
</div>
</main>
<footer>
  <p>© 2024, {{ site.title }}</p>
</footer>
<script>
  document.querySelectorAll('.iframe-container').forEach(container => {
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('open-btn')) return;
      if (container.querySelector('iframe')) return;

      const src = container.dataset.src;
      const placeholder = container.querySelector('.iframe-placeholder');
      const openBtn = container.querySelector('.open-btn');

      placeholder.textContent = 'Loading...';

      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.frameBorder = '0';
      iframe.onload = () => {
        placeholder.remove();
        openBtn.style.display = 'block';
      };
      container.appendChild(iframe);
    });
  });
</script>
</body>
</html>