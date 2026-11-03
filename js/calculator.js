(function () {
    'use strict';

    // Все размеры приводятся к метрам, результат — в м³
    var UNIT_TO_M = { m: 1, cm: 0.01, mm: 0.001 };
    var UNIT_LABEL = { m: 'м', cm: 'см', mm: 'мм' };

    var SHAPES = {
        slab: {
            title: 'Плита / стяжка',
            formula: 'V = Длина × Ширина × Толщина',
            image: 'images/calculator/slab.jpg',
            fields: [
                { id: 'length', label: 'Длина', placeholder: 'например, 6' },
                { id: 'width', label: 'Ширина', placeholder: 'например, 4' },
                { id: 'height', label: 'Толщина', placeholder: 'например, 0.15' }
            ],
            calc: function (v) { return v.length * v.width * v.height; }
        },
        strip: {
            title: 'Ленточный фундамент',
            formula: 'V = Длина ленты × Ширина × Высота',
            image: 'images/calculator/strip.jpg',
            fields: [
                { id: 'length', label: 'Длина ленты (периметр)', placeholder: 'например, 36' },
                { id: 'width', label: 'Ширина ленты', placeholder: 'например, 0.4' },
                { id: 'height', label: 'Высота / глубина', placeholder: 'например, 0.8' }
            ],
            calc: function (v) { return v.length * v.width * v.height; }
        },
        column: {
            title: 'Столб / колонна',
            formula: 'V = A × B × H × Кол-во',
            image: 'images/calculator/column.jpg',
            fields: [
                { id: 'width', label: 'Сторона A', placeholder: 'например, 0.3' },
                { id: 'depth', label: 'Сторона B', placeholder: 'например, 0.3' },
                { id: 'height', label: 'Высота H', placeholder: 'например, 2.5' },
                { id: 'count', label: 'Количество', placeholder: 'например, 8', unitless: true }
            ],
            calc: function (v) { return v.width * v.depth * v.height * v.count; }
        },
        cylinder: {
            title: 'Круглая свая / колонна',
            formula: 'V = π × R² × H × Кол-во',
            image: 'images/calculator/cylinder.jpg',
            fields: [
                { id: 'radius', label: 'Радиус R', placeholder: 'например, 0.15' },
                { id: 'height', label: 'Высота H', placeholder: 'например, 3' },
                { id: 'count', label: 'Количество', placeholder: 'например, 12', unitless: true }
            ],
            calc: function (v) { return Math.PI * v.radius * v.radius * v.height * v.count; }
        }
    };

    var PLACEHOLDERS = {
        m: {
            slab: { length: 'например, 6', width: 'например, 4', height: 'например, 0.15' },
            strip: { length: 'например, 36', width: 'например, 0.4', height: 'например, 0.8' },
            column: { width: 'например, 0.3', depth: 'например, 0.3', height: 'например, 2.5', count: 'например, 8' },
            cylinder: { radius: 'например, 0.15', height: 'например, 3', count: 'например, 12' }
        },
        cm: {
            slab: { length: 'например, 600', width: 'например, 400', height: 'например, 15' },
            strip: { length: 'например, 3600', width: 'например, 40', height: 'например, 80' },
            column: { width: 'например, 30', depth: 'например, 30', height: 'например, 250', count: 'например, 8' },
            cylinder: { radius: 'например, 15', height: 'например, 300', count: 'например, 12' }
        },
        mm: {
            slab: { length: 'например, 6000', width: 'например, 4000', height: 'например, 150' },
            strip: { length: 'например, 36000', width: 'например, 400', height: 'например, 800' },
            column: { width: 'например, 300', depth: 'например, 300', height: 'например, 2500', count: 'например, 8' },
            cylinder: { radius: 'например, 150', height: 'например, 3000', count: 'например, 12' }
        }
    };

    var state = {
        shape: 'slab',
        unit: 'm'
    };

    function $(sel) { return document.querySelector(sel); }
    function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

    function parseNum(el) {
        if (!el) return 0;
        var raw = String(el.value || '').trim().replace(',', '.');
        if (!raw) return 0;
        var n = parseFloat(raw);
        return isFinite(n) ? n : 0;
    }

    function toMeters(value, unitless) {
        if (unitless) return value;
        return value * (UNIT_TO_M[state.unit] || 1);
    }

    function formatVolume(v) {
        if (!isFinite(v) || v <= 0) return '—';
        if (v >= 100) return v.toFixed(1).replace('.', ',');
        if (v >= 10) return v.toFixed(2).replace('.', ',');
        return v.toFixed(3).replace('.', ',');
    }

    function fieldPlaceholder(field) {
        var byUnit = PLACEHOLDERS[state.unit] || PLACEHOLDERS.m;
        var byShape = byUnit[state.shape] || {};
        return byShape[field.id] || field.placeholder;
    }

    function renderFields() {
        var shape = SHAPES[state.shape];
        var container = $('#calcFields');
        var unitLabel = UNIT_LABEL[state.unit] || state.unit;
        var html = '';

        shape.fields.forEach(function (field) {
            var suffix = field.unitless ? 'шт.' : unitLabel;
            html +=
                '<div class="calc-field">' +
                    '<label for="field-' + field.id + '">' + field.label +
                        ' <span class="calc-unit">(' + suffix + ')</span>' +
                    '</label>' +
                    '<input type="number" inputmode="decimal" min="0" step="any" ' +
                        'id="field-' + field.id + '" data-id="' + field.id + '" ' +
                        (field.unitless ? 'data-unitless="1" ' : '') +
                        'placeholder="' + fieldPlaceholder(field) + '" class="form-control calc-input">' +
                '</div>';
        });

        container.innerHTML = html;
        $('#calcFormula').textContent = shape.formula;
        $('#calcShapeImage').src = shape.image;
        $('#calcShapeImage').alt = shape.title;
        $('#calcShapeTitle').textContent = shape.title;

        $all('.calc-input').forEach(function (input) {
            input.addEventListener('input', recalculate);
            input.addEventListener('change', recalculate);
        });

        recalculate();
    }

    function collectValues() {
        var shape = SHAPES[state.shape];
        var values = {};
        shape.fields.forEach(function (field) {
            var el = document.getElementById('field-' + field.id);
            var raw = parseNum(el);
            values[field.id] = toMeters(raw, !!field.unitless);
            if (field.unitless && values[field.id] <= 0) values[field.id] = 1;
        });
        return values;
    }

    function recalculate() {
        var shape = SHAPES[state.shape];
        var values = collectValues();
        var volume = shape.calc(values);
        var stock = parseNum($('#calcStock'));
        if (stock < 0) stock = 0;
        if (stock > 50) stock = 50;

        var withStock = isFinite(volume) && volume > 0 ? volume * (1 + stock / 100) : NaN;

        $('#calcResultRaw').innerHTML = formatVolume(volume) + '<small>м³</small>';
        $('#calcResultStock').innerHTML = formatVolume(withStock) + '<small>м³</small>';

        var resultBox = $('#calcResultBox');
        if (isFinite(withStock) && withStock > 0) {
            resultBox.classList.add('has-result');
            $('#calcOrderHint').hidden = false;
        } else {
            resultBox.classList.remove('has-result');
            $('#calcOrderHint').hidden = true;
        }
    }

    function setShape(shapeId) {
        if (!SHAPES[shapeId]) return;
        state.shape = shapeId;
        $all('.calc-shape-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-shape') === shapeId);
        });
        renderFields();
    }

    function init() {
        $all('.calc-shape-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setShape(btn.getAttribute('data-shape'));
            });
        });

        var unitM = document.querySelector('input[name="calcUnit"][value="m"]');
        if (unitM) unitM.checked = true;

        $all('input[name="calcUnit"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (radio.checked) {
                    state.unit = radio.value;
                    renderFields();
                }
            });
        });

        var stock = $('#calcStock');
        if (stock) {
            stock.addEventListener('input', recalculate);
            stock.addEventListener('change', recalculate);
        }

        var resetBtn = $('#calcReset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                $all('.calc-input').forEach(function (input) { input.value = ''; });
                if (stock) stock.value = '10';
                recalculate();
            });
        }

        setShape('slab');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
