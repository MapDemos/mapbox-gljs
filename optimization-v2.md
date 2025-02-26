---
layout: null
title: Optimization V2
js: optimization.js
---
<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    {% include optimization.css %}
</style>
</head>

<body>
    <div id="map" class="map"></div>
    <div class="overlay-tab">
        <div class="switch-field">
            <input type="radio" id="radio-one" name="switch-one" value="1" checked onchange="toggleInMode()" />
            <label for="radio-one">settings</label>
            <input type="radio" id="radio-two" name="switch-one" value="2" onchange="toggleInMode()" />
            <label for="radio-two">results</label>
        </div>
    </div>
    <div id="overlay" class="overlay">
        <div id="inmode-contents">
            <div class="overlay-line">
            <input id="type-address" type="radio" name="searchType" value="address" checked /><label for="type-address">Use Geocoding</label>
            </div>
            <div class="overlay-line">
                <select id="file-select" onchange="loadFile(this.value)">
                    <option value="">select</option>
                    <option value="202502102020038040">202502102020038040</option>
                    <option value="202502111837332635">202502111837332635</option>
                    <option value="202502111837332636">202502111837332636</option>
                    <option value="202502111837332638">202502111837332638</option>
                    <option value="202502111837332643">202502111837332643</option>
                </select>
            </div>
            <div class="overlay-line">
                <div id="vehicles" class="vehicles">
                </div>
            </div>
        </div>
        <div id="outmode-contents" class="outmode-contents" style="display: none;">
            <a id="result-toggle" onclick="toggleResults()">show/hide details</a><div id="do-again"></div>
            <table id="result-info-table">
            </table><br>
            <table id="result-table">
            </table>
        </div>
    </div>
    <div id="modal" class="modal">
        <div class="modal-content">
            <button class="modal-button small-button" style="background-color: red;" onclick="addTypeMarker('pickup')">集荷</button>
            <button class="modal-button small-button" style="background-color: green;" onclick="addTypeMarker('dropoff')">配達</button>
            <br>
            <div id="coords"></div>
            <div class="overlay-line">
                <textarea class="poi-select" id="poi-search-text"></textarea><button class="modal-button small-button" onclick="search()">検索</button>
            </div>
            <br>
            <div id='listings' class='listings'></div>          
        </div>
    </div>
    <div id="shipment-modal" class="shipment-modal">
        <div class="modal-content">
            集荷時間帯<input type="time" id="shipment-pickup-startime" /><input type="time" id="shipment-pickup-endtime" />
            配達時間帯<input type="time" id="shipment-dropoff-startime" /><input type="time" id="shipment-dropoff-endtime" />
            箱数<input type="number" id="shipment-item-count" />
            荷積み時間（秒）<input type="number" id="shipment-pickup-duration" />
            荷下ろし時間（秒）<input type="number" id="shipment-dropoff-duration" />
            要件<select id="shipment-requirements">
                <option value=""></option>
                <option value="refrigeration">冷蔵</option>
                <option value="freeze">冷凍</option>
                <option value="breakable">割れ物注意</option>
            </select>
            <input type="hidden" id="shipment-id" />
        </div>
    </div>
    <div id="vehicle-modal" class="vehicle-modal">
        <div class="modal-content">
            Vehicle Type<select id="vehicle-type" disabled>
                <option value="1">Driving</option>
                <option value="2">Cycling</option>
                <option value="3">Walking</option>
            </select>
            Start<select id="vehicle-startplace" disabled></select>
            End<select id="vehicle-endplace" disabled></select>
            Start Time<input type="time" id="vehicle-starttime" />
            End Time<input type="time" id="vehicle-endtime" />
            Max Parcels<input type="number" id="vehicle-item-count" />
            Function<select id="vehicle-requirements">
                <option value=""></option>
                <option value="refrigeration">refrigeration</option>
                <option value="freeze">freeze</option>
                <option value="breakable">breakable</option>
            </select>
            <input type="hidden" id="target-vehicle-id" />
            <div class="overlay-line">
                <button id="vehicle-remove-button" class="modal-button" onclick="delVehicle()" style="display: none;">削除</button>
                <button id="vehicle-commit-button" class="modal-button" >calculate</button>
            </div>
        </div>
    </div>
<script>
  {% include 202502102020038040.js %}
  {% include 202502111837332635.js %}
  {% include 202502111837332636.js %}
  {% include 202502111837332638.js %}
  {% include 202502111837332643.js %}
  {% include {{ page.js }} %}
</script>
</body>
</html>