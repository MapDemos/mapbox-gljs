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
  width: 100%; /* Full width of the card */
  height: 200px; /* Set a fixed height for the iframe */
  overflow: hidden;
  border: 1px solid #ddd;
  background-color: #fff;
}

/* The iframe itself */
.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 400%; /* Adjust this to make the iframe content larger */
  height: 400%;
  transform: scale(0.25); /* Scale the content down */
  transform-origin: top left; /* Keep scaling origin at the top-left corner */
  pointer-events: none; /* Disable interaction inside the iframe */
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
      <div class="card">
        <a href="{{ page.url | relative_url }}" target="_blank">
          <div class="iframe-container">
            <iframe src="{{ page.url | relative_url }}" frameborder="0"></iframe>
          </div>
        </a>
        <div class="card-content">
          <h3>{{ page.title | default: page.url }}</h3>
        </div>
      </div>
    {% endif %}
  {% endfor %}

  {% for card in site.data.external %}
  <div class="card">
    <a href="{{ card.url }}" target="_blank">
        <div class="iframe-container">
            <iframe src="{{ card.url }}" class="card-iframe"></iframe>
        </div>
    </a>
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
</body>
</html>