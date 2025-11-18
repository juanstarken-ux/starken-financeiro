#!/usr/bin/env python3
import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar linha inicial e final
start_line = None
end_line = None

for i, line in enumerate(lines):
    if '<!-- Full Width Table - Client List -->' in line:
        start_line = i
    if start_line and '</table>' in line:
        end_line = i + 1
        break

if not start_line or not end_line:
    print("❌ Não encontrou a tabela!")
    exit(1)

print(f"Encontrado: linhas {start_line} até {end_line}")

# Novo HTML
new_content = '''            <!-- Two Column Client Tables -->
            <div class="client-tables-container">
                <div class="client-table-header">
                    <h2 class="section-title">Carteira de Clientes (21 Ativos)</h2>
                    <p class="section-subtitle">Distribuição entre Starken (Matriz) e Alpha (Projeto)</p>
                </div>

                <div class="tables-grid">
                    <!-- STARKEN TABLE -->
                    <div class="company-table-card starken-card">
                        <div class="company-table-header">
                            <div class="company-icon">🚀</div>
                            <div class="company-info">
                                <h3 class="company-name">Starken</h3>
                                <p class="company-label">Empresa Matriz · 13 Clientes</p>
                            </div>
                            <div class="company-stats">
                                <div class="stat-value">R$ 23.036</div>
                                <div class="stat-label">MRR Total</div>
                            </div>
                        </div>

                        <div class="table-wrapper">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Cidade</th>
                                        <th>MRR</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Mortadella Blumenau</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Mortadella Tabajara</strong></td>
                                        <td>Florianópolis</td>
                                        <td><span class="badge-bonus">Bônus</span></td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Brazza BNU</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 3.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Realizzati Móveis</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.500</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>JPR Móveis Rústicos</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Hamburgueria Feio</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Academia São Pedro</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 1.080</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Suprema Pizza</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Shield Car Blumenau</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 297</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estilo Tulipa</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 659</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Rosa Mexicano Blumenau</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-new">Novo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Rosa Mexicano Brusque</strong></td>
                                        <td>Brusque</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-new">Novo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Alexandria Burger</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-new">Novo</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ALPHA TABLE -->
                    <div class="company-table-card alpha-card">
                        <div class="company-table-header">
                            <div class="company-icon alpha-icon">⭐</div>
                            <div class="company-info">
                                <h3 class="company-name">Alpha</h3>
                                <p class="company-label">Projeto Nichado · 8 Clientes</p>
                            </div>
                            <div class="company-stats">
                                <div class="stat-value">R$ 4.000</div>
                                <div class="stat-label">MRR Recorrente</div>
                            </div>
                        </div>

                        <div class="table-wrapper">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Cidade</th>
                                        <th>Modelo</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Oca Restaurante</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Madrugão Lanches</strong></td>
                                        <td>Blumenau</td>
                                        <td>R$ 2.000</td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Pizzaria Don Chevico</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-tcv">TCV Único</span></td>
                                        <td><span class="badge-completed">Concluído</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>World Burger</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-tcv">TCV</span></td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Esfiha Rio</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-transition">Transição</span></td>
                                        <td><span class="badge-pending">Em transição</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Oficina da Massa</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-tcv">TCV</span></td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Bigu's Burger</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-tcv">TCV</span></td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Pizzaria Madrid</strong></td>
                                        <td>Blumenau</td>
                                        <td><span class="badge-tcv">TCV</span></td>
                                        <td><span class="badge-active">Ativo</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

'''

# Substituir
new_lines = lines[:start_line] + [new_content] + lines[end_line:]

# Salvar
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Tabela substituída com sucesso!")
print(f"Removido: {end_line - start_line} linhas")
print(f"Adicionado: 1 bloco novo")
