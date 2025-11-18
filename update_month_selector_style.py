#!/usr/bin/env python3
# Script para melhorar o estilo do seletor de mês

import re

# Ler o arquivo
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remover o CSS antigo do seletor de mês
content = re.sub(
    r'/\* Month Selector \*/.*?\.month-btn\.active \{[^}]+\}',
    '',
    content,
    flags=re.DOTALL
)

# 2. Adicionar novo CSS mais limpo
new_css = '''
        /* Month Selector */
        .month-selector-container {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: var(--white);
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .month-selector-label {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-light);
        }

        .month-select {
            padding: 6px 12px;
            border: 1px solid var(--border-color);
            background: var(--white);
            color: var(--text-dark);
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            outline: none;
        }

        .month-select:hover {
            border-color: var(--primary-green);
        }

        .month-select:focus {
            border-color: var(--primary-green);
            box-shadow: 0 0 0 3px rgba(74, 107, 84, 0.1);
        }
'''

# Adicionar antes do fechamento da tag style
content = content.replace('</style>', new_css + '\n    </style>')

# 3. Substituir o HTML do seletor de mês
old_selector_html = r'<!-- Month Selector -->.*?</div>\s*</div>'

new_selector_html = '''<!-- Month Selector -->
            <div class="month-selector-container">
                <span class="month-selector-label">📅 Período:</span>
                <select class="month-select" onchange="changeMes(this.value)">
                    <option value="2025-11">Novembro 2025</option>
                    <option value="2025-12" selected>Dezembro 2025</option>
                </select>
            </div>'''

content = re.sub(old_selector_html, new_selector_html, content, flags=re.DOTALL)

# 4. Atualizar a função changeMes para funcionar com select
old_function = r'function changeMes\(mesChave\) \{[^}]*event\.target\.classList\.add\(\'active\'\);[^}]*\}'

new_function = '''function changeMes(mesChave) {
            mesAtual = mesChave;

            // Atualizar KPIs
            atualizarKPIs(mesChave);

            // Atualizar gráficos
            atualizarGraficos(mesChave);
        }'''

content = re.sub(old_function, new_function, content, flags=re.DOTALL)

# Salvar o arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Seletor de mês atualizado com design melhorado!")
print("✅ Agora usa um dropdown select limpo e discreto")
