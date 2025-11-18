#!/usr/bin/env python3
# Script para adicionar gráficos e analytics nas páginas de Contas a Pagar/Receber

import re

# Ler contas-receber.html
with open('pages/contas-receber.html', 'r', encoding='utf-8') as f:
    receber_content = f.read()

# Adicionar gráficos após os summary cards (antes da tabela)
analytics_section = '''
            <!-- Analytics Section -->
            <div class="analytics-grid">
                <!-- Gráfico de Pizza: Recebido vs Pendente -->
                <div class="analytics-card">
                    <div class="card-header">
                        <h3 class="card-title">Status de Recebimentos</h3>
                        <span class="card-badge" id="statusBadge">Atualizado</span>
                    </div>
                    <div class="chart-container">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Barras: Top 5 Clientes -->
                <div class="analytics-card">
                    <div class="card-header">
                        <h3 class="card-title">Top 5 Maiores Receitas</h3>
                        <span class="card-info">Do mês selecionado</span>
                    </div>
                    <div class="chart-container">
                        <canvas id="top5Chart"></canvas>
                    </div>
                </div>

                <!-- KPI Cards Adicionais -->
                <div class="analytics-card kpi-card">
                    <div class="kpi-content">
                        <div class="kpi-icon">📈</div>
                        <div class="kpi-data">
                            <div class="kpi-label">Ticket Médio</div>
                            <div class="kpi-big-value" id="ticketMedio">R$ 0</div>
                            <div class="kpi-trend">por cliente ativo</div>
                        </div>
                    </div>
                </div>

                <div class="analytics-card kpi-card">
                    <div class="kpi-content">
                        <div class="kpi-icon">🎯</div>
                        <div class="kpi-data">
                            <div class="kpi-label">Meta de Recebimento</div>
                            <div class="kpi-big-value" id="metaRecebimento">85%</div>
                            <div class="kpi-trend" id="metaTrend">Meta: 80%</div>
                        </div>
                    </div>
                </div>
            </div>

'''

# Inserir analytics antes da tabela
receber_content = receber_content.replace(
    '            <!-- Data Table -->',
    analytics_section + '            <!-- Data Table -->'
)

# Adicionar CSS para os novos componentes
analytics_css = '''
        /* Analytics Grid */
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        @media (max-width: 1200px) {
            .analytics-grid {
                grid-template-columns: 1fr;
            }
        }

        .analytics-card {
            background: var(--white);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border: 1px solid var(--border-color);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-dark);
        }

        .card-badge {
            font-size: 11px;
            padding: 4px 10px;
            background: #d4edda;
            color: #155724;
            border-radius: 12px;
            font-weight: 600;
        }

        .card-info {
            font-size: 12px;
            color: var(--text-light);
        }

        .chart-container {
            position: relative;
            height: 250px;
        }

        /* KPI Cards dentro da grid */
        .kpi-card {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .kpi-content {
            display: flex;
            align-items: center;
            gap: 20px;
            width: 100%;
        }

        .kpi-icon {
            font-size: 48px;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%);
            border-radius: 16px;
        }

        .kpi-data {
            flex: 1;
        }

        .kpi-label {
            font-size: 12px;
            color: var(--text-light);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .kpi-big-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--primary-green);
            margin-bottom: 4px;
        }

        .kpi-trend {
            font-size: 13px;
            color: var(--text-light);
        }

'''

# Adicionar CSS antes do fechamento do style
receber_content = receber_content.replace('</style>', analytics_css + '    </style>')

# Salvar arquivo atualizado
with open('pages/contas-receber.html', 'w', encoding='utf-8') as f:
    f.write(receber_content)

print("✅ Analytics adicionados em contas-receber.html")
print("   - Gráfico: Status de Recebimentos (Pizza)")
print("   - Gráfico: Top 5 Maiores Receitas (Barras)")
print("   - KPI: Ticket Médio")
print("   - KPI: Meta de Recebimento")
