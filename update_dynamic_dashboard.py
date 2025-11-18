#!/usr/bin/env python3
# Script para adicionar seletor de mês e tornar dashboard dinâmico

import re

# Ler o arquivo
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar CSS para o seletor de mês
css_month_selector = '''
        /* Month Selector */
        .month-selector-container {
            background: var(--white);
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border: 1px solid var(--border-color);
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .month-selector-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
            margin-right: 15px;
        }

        .month-buttons {
            display: flex;
            gap: 10px;
        }

        .month-btn {
            padding: 10px 20px;
            border: 2px solid var(--border-color);
            background: var(--white);
            color: var(--text-dark);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .month-btn:hover {
            border-color: var(--primary-green);
            background: var(--light-green);
        }

        .month-btn.active {
            background: var(--primary-green);
            color: var(--white);
            border-color: var(--primary-green);
        }
'''

# Adicionar CSS antes do fechamento da tag style
content = content.replace('</style>', css_month_selector + '\n    </style>')

# 2. Adicionar HTML do seletor de mês logo após o header
month_selector_html = '''
            <!-- Month Selector -->
            <div class="month-selector-container">
                <div class="month-selector-label">📅 Visualizar dados de:</div>
                <div class="month-buttons">
                    <button class="month-btn" onclick="changeMes('2025-11')">Novembro 2025</button>
                    <button class="month-btn active" onclick="changeMes('2025-12')">Dezembro 2025</button>
                </div>
            </div>
'''

# Adicionar após o header (antes dos KPI cards)
content = re.sub(
    r'(</div>\s*<!-- KPI Cards -->)',
    month_selector_html + r'\n\1',
    content,
    count=1
)

# 3. Atualizar o subtítulo para ser dinâmico
content = re.sub(
    r'<p class="page-subtitle">Visão geral do desempenho financeiro - Dezembro 2025</p>',
    '<p class="page-subtitle" id="page-subtitle">Visão geral do desempenho financeiro - <span id="periodo-atual">Dezembro 2025</span></p>',
    content
)

# 4. Adicionar IDs aos elementos que precisam ser atualizados dinamicamente
# KPI Cards
content = re.sub(
    r'<div class="kpi-value">R\$ 38\.030</div>',
    '<div class="kpi-value" id="kpi-mrr">R$ 38.030</div>',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-change positive">\s*↑ 6\.3% vs novembro',
    '<div class="kpi-change positive" id="kpi-mrr-change">↑ 6.3% vs novembro',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-value">21</div>',
    '<div class="kpi-value" id="kpi-clientes">21</div>',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-change positive">\s*\+2 novos clientes em dezembro',
    '<div class="kpi-change positive" id="kpi-clientes-change">+2 novos clientes em dezembro',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-value">R\$ 21\.361</div>',
    '<div class="kpi-value" id="kpi-despesas">R$ 21.361</div>',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-change negative">\s*↑ 29,4% vs novembro',
    '<div class="kpi-change negative" id="kpi-despesas-change">↑ 29,4% vs novembro',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-value">R\$ 16\.669</div>',
    '<div class="kpi-value" id="kpi-resultado">R$ 16.669</div>',
    content,
    count=1
)

content = re.sub(
    r'<div class="kpi-change positive">\s*43,8% de margem',
    '<div class="kpi-change positive" id="kpi-resultado-margem">43,8% de margem',
    content,
    count=1
)

# 5. Adicionar script para carregar dados-mensais.js
# Encontrar onde está o script tag de auth.js e adicionar dados-mensais.js antes
content = re.sub(
    r'<script src="auth\.js"></script>',
    '<script src="dados-mensais.js"></script>\n    <script src="auth.js"></script>',
    content
)

# Salvar o arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Seletor de mês adicionado com sucesso!")
print("✅ IDs dinâmicos adicionados aos KPIs")
print("✅ Script dados-mensais.js incluído")
